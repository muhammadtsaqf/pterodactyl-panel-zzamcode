import express from 'express';
import cors from 'cors';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion, jidNormalizedUser } from '@whiskeysockets/baileys';
import pino from 'pino';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Read Pterodactyl .env
const envPath = path.resolve('../.env');
let APP_URL = 'http://127.0.0.1';
let WA_BOT_SECRET = 'pterodactyl_wa_secret';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/^APP_URL=(.*)$/m);
    if (urlMatch) APP_URL = urlMatch[1].replace(/['"]/g, '').trim();
    
    const secretMatch = envContent.match(/^WA_BOT_SECRET=(.*)$/m);
    if (secretMatch) WA_BOT_SECRET = secretMatch[1].replace(/['"]/g, '').trim();
}

const app = express();
app.use(cors());
app.use(express.json());

let sock = null;
let currentStatus = 'offline';

const pm2Logs = [];
const originalLog = console.log;
const originalError = console.error;

function pushLog(type, args) {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    pm2Logs.push(`[${new Date().toISOString()}] [${type.toUpperCase()}] ${msg}`);
    if (pm2Logs.length > 100) pm2Logs.shift();
}

console.log = function(...args) {
    pushLog('info', args);
    originalLog.apply(console, args);
};
console.error = function(...args) {
    pushLog('error', args);
    originalError.apply(console, args);
};

async function startBot(targetNumber) {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version: v } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        auth: state,
        version: v,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Safari'),
        syncFullHistory: false,
        markOnlineOnConnect: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            currentStatus = 'offline';
            if (shouldReconnect) {
                startBot();
            } else {
                sock = null;
            }
        } else if (connection === 'open') {
            currentStatus = 'online';
            try {
                await sock.sendPresenceUpdate('available');
            } catch (e) {}
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // Auto read
        try {
            await sock.readMessages([msg.key]);
            await sock.sendPresenceUpdate('available', msg.key.remoteJid);
        } catch (e) {}

        // Normalize JID to ensure we get the clean phone number without device suffixes
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const normalizedJid = jidNormalizedUser(senderJid);
        const sender = normalizedJid.split('@')[0];
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        if (!text) return;

        console.log(`[MESSAGE] Incoming from Raw: ${msg.key.remoteJid} | Participant: ${msg.key.participant} | Parsed Sender: ${sender}`);

        try {
            // Forward to Pterodactyl Laravel Webhook
            const response = await axios.post(`${APP_URL}/api/bot/webhook`, {
                secret: WA_BOT_SECRET,
                phone: sender,
                message: text
            }, {
                headers: { 'Accept': 'application/json' },
                validateStatus: false // Prevent throwing error on 4xx/5xx
            });

            if (response.data && response.data.reply) {
                await sock.sendMessage(msg.key.remoteJid, { text: response.data.reply }, { quoted: msg });
            }
        } catch (err) {
            console.error('Failed to send webhook to Pterodactyl:', err.message);
            await sock.sendMessage(msg.key.remoteJid, { text: 'Bot sedang mengalami gangguan internal.' });
        }
    });

    if (!sock.authState.creds.registered && targetNumber) {
        currentStatus = 'pairing';
        // Wait a few seconds for the socket connection to initialize before requesting code
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
            const code = await sock.requestPairingCode(targetNumber);
            return code;
        } catch (err) {
            console.error('Pairing code error:', err);
            throw new Error('Gagal mendapatkan pairing code, pastikan nomor benar dan layanan WA tidak memblokir. Pesan: ' + err.message);
        }
    }

    return null;
}

app.post('/api/start', async (req, res) => {
    if (currentStatus === 'online') {
        return res.json({ success: false, message: 'Bot is already online.' });
    }
    
    const { number } = req.body;
    try {
        if (!sock || !sock.authState.creds.registered) {
            if (!number) return res.json({ success: false, message: 'Number is required for pairing.' });
            
            // Format number (remove + or spaces)
            const cleanNumber = number.replace(/\D/g, '');
            const code = await startBot(cleanNumber);
            return res.json({ success: true, pairingCode: code, status: 'pairing' });
        } else {
            await startBot();
            return res.json({ success: true, status: 'connecting' });
        }
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
});

app.post('/api/stop', async (req, res) => {
    let message = 'Bot dihentikan.';
    if (sock) {
        try {
            sock.logout();
        } catch (e) {}
        sock = null;
    }
    currentStatus = 'offline';
    
    // Always clear auth state to allow new pairing
    if (fs.existsSync('auth_info_baileys')) {
        fs.rmSync('auth_info_baileys', { recursive: true, force: true });
        message = 'Sesi dihapus dan bot dihentikan.';
    }
    
    return res.json({ success: true, status: 'offline', message });
});

app.post('/api/clear', async (req, res) => {
    if (sock) {
        try {
            sock.logout();
        } catch (e) {}
        sock = null;
    }
    currentStatus = 'offline';
    
    if (fs.existsSync('auth_info_baileys')) {
        fs.rmSync('auth_info_baileys', { recursive: true, force: true });
    }
    
    return res.json({ success: true, status: 'offline', message: 'Sesi berhasil dihapus secara paksa.' });
});

app.get('/api/status', (req, res) => {
    res.json({ status: currentStatus, registered: sock?.authState?.creds?.registered || false });
});

app.get('/api/logs', (req, res) => {
    res.json({ success: true, logs: pm2Logs });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`WhatsApp Bot Service running on port ${PORT}`);
    // Auto-start if credentials exist
    if (fs.existsSync('auth_info_baileys/creds.json')) {
        startBot();
    }
});
