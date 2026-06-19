@extends('layouts.admin')

@section('title')
    WhatsApp Bot Configuration
@endsection

@section('content-header')
    <h1>WhatsApp Bot<small>Manajemen layanan WhatsApp Bot Pterodactyl Anda.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">WhatsApp Bot</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12 col-md-6">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Manajemen Bot</h3>
            </div>
            <div class="box-body">
                <div id="bot-alert" class="alert hidden"></div>
                <div class="form-group">
                    <label class="control-label" for="wa_number">Nomor WhatsApp Bot</label>
                    <input type="text" id="wa_number" class="form-control" placeholder="Contoh: 6281234567890">
                    <p class="text-muted small">Masukkan nomor yang akan dijadikan Bot. Tanpa tanda <code>+</code>.</p>
                </div>
                
                <div class="form-group" id="pairing-container" style="display: none;">
                    <label class="control-label">Pairing Code Anda:</label>
                    <h2 id="pairing-code" class="text-center text-success" style="font-weight: bold; letter-spacing: 5px; margin-top: 10px; margin-bottom: 10px;">-</h2>
                    <p class="text-muted small text-center">Buka WhatsApp di HP Anda > Perangkat Tautkan > Tautkan dengan Nomor Telepon. Masukkan kode di atas.</p>
                </div>
            </div>
            <div class="box-footer">
                <button type="button" class="btn btn-sm btn-primary" id="btn-start">Start Bot & Dapatkan Pairing Code</button>
                <button type="button" class="btn btn-sm btn-warning" id="btn-stop">Stop Bot</button>
                <button type="button" class="btn btn-sm btn-danger pull-right" id="btn-clear">Hapus Session</button>
            </div>
        </div>
    </div>
    
    <div class="col-xs-12 col-md-6">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Status Sistem</h3>
            </div>
            <div class="box-body">
                <table class="table table-bordered">
                    <tbody>
                        <tr>
                            <td><strong>Status Bot</strong></td>
                            <td><span id="status-badge" class="label label-default">Menunggu...</span></td>
                        </tr>
                        <tr>
                            <td><strong>Terkoneksi ke WhatsApp</strong></td>
                            <td><span id="registered-badge" class="label label-default">-</span></td>
                        </tr>
                        <tr>
                            <td><strong>Layanan Node.js (PM2)</strong></td>
                            <td><span id="pm2-badge" class="label label-default">Memeriksa...</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
</div>
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Terminal Logs (Node.js)</h3>
            </div>
            <div class="box-body" style="background-color: #1e1e1e; padding: 0;">
                <pre id="terminal-logs" style="background-color: transparent; border: none; color: #00ff00; height: 300px; overflow-y: scroll; margin: 0; padding: 15px; font-family: 'Courier New', Courier, monospace; font-size: 13px;">[SYSTEM] Menghubungkan ke layanan Bot PM2...</pre>
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
@parent
<script>
$(document).ready(function() {
    function showAlert(type, message) {
        $('#bot-alert').removeClass('hidden alert-success alert-danger alert-warning').addClass('alert-' + type).text(message).show();
    }

    function checkStatus() {
        $.get('{{ route("admin.whatsapp.status") }}', function(data) {
            if(data.error) {
                $('#pm2-badge').removeClass('label-success').addClass('label-danger').text('Offline / Tidak Berjalan');
                $('#status-badge').removeClass('label-success label-warning label-info').addClass('label-default').text('Unknown');
                $('#registered-badge').removeClass('label-success').addClass('label-danger').text('No');
            } else {
                $('#pm2-badge').removeClass('label-danger label-default').addClass('label-success').text('Running');
                
                let badgeClass = 'label-default';
                if(data.status === 'online') badgeClass = 'label-success';
                else if(data.status === 'pairing') badgeClass = 'label-warning';
                else if(data.status === 'connecting') badgeClass = 'label-info';
                
                $('#status-badge').removeClass('label-success label-warning label-info label-default').addClass(badgeClass).text(data.status.toUpperCase());
                
                if(data.registered) {
                    $('#registered-badge').removeClass('label-danger label-default').addClass('label-success').text('Yes');
                    $('#pairing-container').hide();
                } else {
                    $('#registered-badge').removeClass('label-success label-default').addClass('label-danger').text('No');
                }
            }
        });
    }

    // Check status every 5 seconds
    checkStatus();
    setInterval(checkStatus, 5000);

    // Fetch terminal logs
    function fetchLogs() {
        $.get('{{ route("admin.whatsapp.logs") }}', function(data) {
            if(data.logs && data.logs.length > 0) {
                var term = $('#terminal-logs');
                // Auto scroll to bottom if already at bottom
                var isScrolledToBottom = term[0].scrollHeight - term.scrollTop() <= term.outerHeight() + 10;
                term.text(data.logs.join('\n'));
                if(isScrolledToBottom) {
                    term.scrollTop(term[0].scrollHeight);
                }
            } else if (data.logs) {
                $('#terminal-logs').text(data.logs.join('\n'));
            }
        });
    }

    fetchLogs();
    setInterval(fetchLogs, 3000);

    $('#btn-start').click(function() {
        var btn = $(this);
        var number = $('#wa_number').val();
        
        btn.prop('disabled', true).text('Loading...');
        
        $.ajax({
            url: '{{ route("admin.whatsapp.start") }}',
            type: 'POST',
            data: {
                number: number,
                _token: '{{ csrf_token() }}'
            },
            success: function(response) {
                if(response.success) {
                    if(response.pairingCode) {
                        $('#pairing-code').text(response.pairingCode);
                        $('#pairing-container').slideDown();
                        showAlert('success', 'Silakan masukkan kode pairing ke aplikasi WhatsApp Anda.');
                    } else if(response.status === 'connecting') {
                        showAlert('info', 'Bot sedang mencoba reconnecting menggunakan kredensial lama.');
                    }
                } else {
                    showAlert('danger', response.message);
                }
                btn.prop('disabled', false).text('Start Bot & Dapatkan Pairing Code');
                checkStatus();
            },
            error: function() {
                showAlert('danger', 'Gagal menghubungi server proxy. Cek console log.');
                btn.prop('disabled', false).text('Start Bot & Dapatkan Pairing Code');
            }
        });
    });

    $('#btn-stop').click(function() {
        if(!confirm('Apakah Anda yakin ingin mematikan dan me-logout bot?')) return;
        
        var btn = $(this);
        btn.prop('disabled', true).text('Stopping...');
        
        $.ajax({
            url: '{{ route("admin.whatsapp.stop") }}',
            type: 'POST',
            data: {
                _token: '{{ csrf_token() }}'
            },
            success: function(response) {
                if(response.success) {
                    showAlert('success', response.message || 'Bot berhasil dimatikan dan di-logout.');
                    $('#pairing-container').hide();
                } else {
                    showAlert('warning', response.message);
                }
                btn.prop('disabled', false).text('Stop Bot');
                checkStatus();
            },
            error: function() {
                showAlert('danger', 'Gagal menghubungi server.');
                btn.prop('disabled', false).text('Stop Bot');
            }
        });
    });

    $('#btn-clear').click(function() {
        if(!confirm('Apakah Anda yakin ingin menghapus data sesi secara paksa? Ini akan menghapus file auth di server.')) return;
        
        var btn = $(this);
        btn.prop('disabled', true).text('Menghapus...');
        
        $.ajax({
            url: '{{ route("admin.whatsapp.clear") }}',
            type: 'POST',
            data: {
                _token: '{{ csrf_token() }}'
            },
            success: function(response) {
                if(response.success) {
                    showAlert('success', response.message || 'Sesi berhasil dihapus secara paksa.');
                    $('#pairing-container').hide();
                } else {
                    showAlert('warning', response.message);
                }
                btn.prop('disabled', false).text('Hapus Session');
                checkStatus();
            },
            error: function() {
                showAlert('danger', 'Gagal menghubungi server.');
                btn.prop('disabled', false).text('Hapus Session');
            }
        });
    });
});
</script>
@endsection
