import React from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { Link } from 'react-router-dom';
import tw, { styled } from 'twin.macro';

const Container = styled.div`
    ${tw`min-h-screen w-full relative overflow-hidden flex flex-col items-center`};
    background: linear-gradient(135deg, #0b0f19 0%, #151029 100%);
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
`;

const Navbar = styled.nav`
    ${tw`flex items-center justify-between w-full max-w-6xl px-8 py-4 mt-8 rounded-full`};
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    color: #1e293b;
`;

const NavLinks = styled.div`
    ${tw`hidden md:flex gap-8 text-sm font-medium`};
    
    span {
        ${tw`cursor-pointer text-neutral-500 hover:text-indigo-600 transition-colors`};
    }
`;

const NavButtons = styled.div`
    ${tw`flex items-center gap-6 text-sm font-medium`};
    
    .login {
        ${tw`cursor-pointer text-neutral-700 hover:text-indigo-600 transition-colors`};
    }
    
    .register {
        ${tw`px-6 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-lg`};
    }
`;

const ContentWrapper = styled.div`
    ${tw`flex-1 w-full max-w-6xl px-8 mt-24 relative z-10 flex flex-col md:flex-row justify-between`};
`;

const LeftSection = styled.div`
    ${tw`max-w-lg mt-12`};
`;

const Badge = styled.div`
    ${tw`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider mb-8`};
    background: rgba(255, 255, 255, 0.9);
    color: #6366f1;
    
    &::before {
        content: '';
        ${tw`w-2 h-2 rounded-full bg-indigo-500`};
    }
`;

const Title = styled.h1`
    ${tw`text-5xl md:text-6xl font-extrabold leading-tight mb-6`};
    background: linear-gradient(to right, #4f46e5, #9333ea);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.1));
`;

const TitleOverlay = styled.h1`
    ${tw`text-5xl md:text-6xl font-extrabold leading-tight mb-6 absolute top-0 left-0`};
    color: #ffffff;
    opacity: 0.1;
    z-index: -1;
    transform: translate(2px, 2px);
`;

const TitleContainer = styled.div`
    ${tw`relative`};
`;

const Subtitle = styled.p`
    ${tw`text-lg text-slate-400 leading-relaxed mb-10`};
`;

const ActionButtons = styled.div`
    ${tw`flex gap-4`};
    
    .btn-primary {
        ${tw`px-8 py-4 rounded-xl text-white font-semibold transition-all shadow-lg shadow-indigo-500/30`};
        background: #6366f1;
        &:hover {
            background: #4f46e5;
            transform: translateY(-2px);
        }
    }
    
    .btn-secondary {
        ${tw`px-8 py-4 rounded-xl text-slate-900 bg-white font-semibold transition-all shadow-lg`};
        &:hover {
            background: #f8fafc;
            transform: translateY(-2px);
        }
    }
`;

const RightSection = styled.div`
    ${tw`hidden md:flex relative w-full max-w-lg items-center justify-center`};
`;

const Blob = styled.div`
    ${tw`absolute rounded-full`};
    width: 450px;
    height: 450px;
    background: linear-gradient(135deg, #6366f1, #9333ea);
    filter: blur(2px);
    opacity: 0.9;
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    animation: morph 8s ease-in-out infinite;

    @keyframes morph {
        0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
        67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
    }
`;

const StatCard = styled.div`
    ${tw`absolute p-6 rounded-3xl backdrop-blur-md shadow-2xl`};
    background: rgba(255, 255, 255, 0.9);
    color: #1e293b;
    width: 240px;
    
    h3 {
        ${tw`text-xs font-bold text-slate-400 tracking-wider uppercase mb-1`};
    }
    
    .number {
        ${tw`text-4xl font-extrabold text-indigo-600 mb-2`};
    }
    
    p {
        ${tw`text-xs text-slate-500 leading-relaxed`};
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'Pterodactyl');

    return (
        <Container>
            <Navbar>
                <div className="flex items-center gap-3">
                    {/* Placeholder Logo matching theme */}
                    <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 512 512" fill="currentColor">
                        <path d="M492.4 122.9c-16.1-23.7-41.5-39.6-69.8-43.1-21-2.6-42.5 1.7-61.4 12.3-15.5 8.7-28.7 21-39 35.5-12.7 18-21.7 38.6-26.6 60.1-2.3 10-3.6 20.3-4 30.7-31.5-6.6-64-8-96.1-4.2-31.3 3.8-61.7 13.5-89.9 28.5-18.7 10-36.2 22.3-51.5 36.6-13.6 12.7-25.2 27.5-34.1 43.8-7.8 14.3-13.6 29.5-17.1 45.4-2.6 11.7-3.9 23.7-3.9 35.7 0 5.4.3 10.8 1 16.2 1.3 10.3 4 20.2 8.1 29.6 5.5 12.8 13.4 24.3 23.1 33.9 12.6 12.4 28.5 21.2 45.8 25.1 14.3 3.2 29.2 3.6 43.8 1 14.4-2.6 28.2-8.2 40.5-16.5 14.2-9.5 26.3-21.6 35.5-35.7 13.9-21.4 21.9-46.1 23.3-71.7.5-8.9.1-17.8-1-26.6 19.3-10.4 39.8-18.3 61.2-23.5 18-4.3 36.6-6.7 55.4-7.2 21.3-.5 42.6 1.7 63.3 6.6 18.5 4.4 36.2 11.6 52.5 21.3 11.5 6.8 22 15 31.1 24.5 13.5 14.1 23.1 31.1 28 50.1 2.2 8.5 3.3 17.3 3.3 26.2 0 4.2-.3 8.3-.8 12.5-1 8.8-3.1 17.3-6.1 25.4-3.1 8.4-7.3 16.3-12.5 23.5-9.3 12.9-21.2 23.6-34.9 31.4-15 8.5-31.5 13.8-48.7 15.6-15 .1-30.1-2.4-44.4-7.5-13.1-4.7-25.2-11.7-35.8-20.6-11.4-9.5-20.9-21-28-34.1-11-20.2-16.5-43-16.1-66.2.3-18.2 4.1-36 11.2-52.6 3.6-8.5 8-16.6 13-24.1 7.1-10.8 15.6-20.5 25.3-28.9 22.8-19.8 50.8-33.1 81.1-38.3 12.1-2.1 24.5-2.8 36.8-2 15 .9 29.8 4 43.8 9.2 12.7 4.7 24.5 11.3 35.1 19.5 13.1 10.2 24.1 22.8 32.2 37 9.1 16 14.8 33.3 16.7 51.3 1.1 10.3 1 20.7-.3 31-1.3 10-3.9 19.7-7.7 28.9-5.3 12.8-12.7 24.6-21.9 34.7-14.7 16-32.9 28.1-53.2 35.3-20.1 7.1-41.5 9.4-62.4 6.7-19.1-2.4-37.4-8.8-54.1-18.9-15.1-9.1-28.5-21-39.2-34.9-14-18.3-23.7-39.3-28.5-61.4-2.8-12.8-3.9-25.9-3.2-39 .8-16.4 4.1-32.5 9.7-47.9 6.2-17.1 14.8-33 25.5-47.3 14.5-19.3 32.2-35.8 52.2-49 22.5-14.8 47.7-25.2 74.3-30.6 14.7-3 29.8-4.3 44.9-3.9 20.1.5 40 4.1 59 10.7 17 5.9 32.9 14.3 47.3 25.1 16 11.9 29.6 26.5 40 43.1 10 15.9 16.9 33.4 20.3 51.7 1.8 9.9 2.4 20 1.6 30-.8 9.9-2.7 19.6-5.7 28.8-4.5 13.9-11 26.8-19.3 38.3-11.8 16.2-26.6 29.8-43.5 39.8-18.1 10.7-38.1 17.5-59 19.9-20.2 2.3-40.7 1.1-60.5-3.6-18.7-4.4-36.4-12.2-52.2-22.9-16.5-11.2-30.7-25.4-41.6-41.8-14.3-21.5-23.6-45.6-27.3-71-2.1-14.2-2.5-28.7-1.1-42.9 1.7-17 5.7-33.5 11.9-49.1 7.6-18.9 17.9-36.3 30.2-51.5 15.5-19.1 34.3-35.1 55.4-46.8 23.3-12.9 49-21.3 75.8-24.8 15.2-2 30.6-2.3 45.9-.9 20.6 1.9 40.8 7 59.8 15 16.8 7.1 32.3 16.8 46.1 28.5 16.8 14.3 30.5 31.8 40.4 51.5 8.9 17.8 14.5 36.9 16.5 56.4 1 9.9 1.1 20 .2 29.9-1 10.8-3.2 21.3-6.6 31.4-4.8 14.2-11.5 27.6-20 39.8-11.1 15.9-24.6 29.7-39.8 40.7-17.6 12.8-37.3 22-58.2 27.2-20 5-40.8 6.5-61.2 4.4-20.6-2.1-40.8-7.8-59.5-16.7-17.9-8.5-34.2-20-48.1-33.9-16-16.1-28.7-35-37.6-55.8-8-18.8-13.3-38.6-15.7-59-.9-7.9-1.3-15.8-1.1-23.8.2-8.8.9-17.5 2.1-26.1 1.7-12 4.3-23.8 7.8-35.1 5.3-17.1 12.5-33.4 21.4-48.5 13.2-22.3 30.4-41.6 50.6-56.9 23-17.3 49.6-29.5 77.9-35.7 15.4-3.4 31.2-5 47-4.8 21.6.3 42.8 4.1 62.8 11.2 18.2 6.5 35.2 15.7 50.4 27.3 18.2 13.9 33.3 31.3 44 51.2 10.2 19 16.5 39.6 18.5 60.7.9 9.3.9 18.7 0 28-.9 10.3-2.9 20.4-6 30.2-4.5 14.1-10.7 27.6-18.5 40-10.4 16.6-23.4 31.3-38.3 43.1-17.4 13.8-37.2 24.1-58.4 30.2-20 5.8-41 8.1-61.6 6.8-21.4-1.3-42.3-6.5-61.8-15.3-18.6-8.4-35.5-20.1-49.8-34.4-16.4-16.4-29.4-35.8-38.3-57.2-7.8-18.8-12.8-38.5-14.8-58.7-.7-7.3-1.1-14.7-1-22.1.2-9 .8-17.9 2-26.7 1.8-12.7 4.7-25.1 8.5-37 5.9-18.4 14.1-35.8 24.2-51.8 15.1-24 34.6-44.5 57.3-60.5 25.8-18.2 55.3-30.5 86.4-36 15.8-2.8 32-4 48.2-3.4 22.8.8 45.1 5.4 65.9 13.5 19 7.4 36.6 17.6 52.3 30.3 18.3 14.7 33.5 32.6 44.5 52.8 10.5 19.3 17 40 19 61.4 1.1 11.3.8 22.7-.8 33.8z"/>
                    </svg>
                    <span className="font-bold text-lg">{name}</span>
                </div>
                <NavLinks>
                    <span>Beranda</span>
                    <span>Pricing</span>
                    <span>FAQ</span>
                </NavLinks>
                <NavButtons>
                    <Link to="/auth/login" className="login">Masuk</Link>
                    <Link to="/auth/register" className="register">Daftar</Link>
                </NavButtons>
            </Navbar>

            <ContentWrapper>
                <LeftSection>
                    <Badge>PTERODACTYL + ELYSIUM THEME</Badge>
                    <TitleContainer>
                        <TitleOverlay>Kelola Server Lebih Cepat dan Modern.</TitleOverlay>
                        <Title>Kelola Server Lebih Cepat dan Modern.</Title>
                    </TitleContainer>
                    <Subtitle>
                        Halaman playground untuk eksplorasi fitur panel, status server, 
                        keamanan akun, dan pembaruan Elysium Theme.
                    </Subtitle>
                    <ActionButtons>
                        <Link to="/auth/login" className="btn-primary">Masuk ke Panel</Link>
                        <Link to="/auth/register" className="btn-secondary">Daftar Akun Baru</Link>
                    </ActionButtons>
                </LeftSection>
                <RightSection>
                    <Blob />
                    <StatCard style={{ top: '-10%', left: '-10%' }}>
                        <h3>Total Users</h3>
                        <div className="number">11</div>
                        <p>Pengguna aktif di panel setiap bulan.</p>
                    </StatCard>
                    <StatCard style={{ bottom: '-15%', right: '-10%' }}>
                        <h3>Total Servers</h3>
                        <div className="number">7</div>
                        <p>Server dikelola stabil dengan uptime tinggi.</p>
                    </StatCard>
                </RightSection>
            </ContentWrapper>
        </Container>
    );
};
