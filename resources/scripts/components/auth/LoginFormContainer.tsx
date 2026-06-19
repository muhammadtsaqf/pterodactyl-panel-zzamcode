import React, { forwardRef } from 'react';
import { useStoreState } from 'easy-peasy';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
    subtitle?: string;
};

const Wrapper = styled.div`
    ${tw`min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden`};
    background: linear-gradient(135deg, #0b0f19 0%, #151029 100%);
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
`;

const BlobLeft = styled.div`
    ${tw`absolute rounded-full`};
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(15,23,42,0) 70%);
    top: -200px;
    left: -200px;
    filter: blur(40px);
    z-index: 0;
`;

const BlobRight = styled.div`
    ${tw`absolute rounded-full`};
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(15,23,42,0) 70%);
    bottom: -200px;
    right: -200px;
    filter: blur(40px);
    z-index: 0;
`;

const Container = styled.div`
    ${tw`relative z-10 w-full`};
    max-width: 480px;
    padding: 20px;
`;

const Card = styled.div`
    ${tw`w-full p-8 md:p-10 relative`};
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 28px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const FooterText = styled.p`
    ${tw`text-center text-neutral-500 text-xs mt-8 relative z-10 font-medium`};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, subtitle, ...props }, ref) => {
    const logo = useStoreState((state: any) => state.settings.data?.logo);
    const name = useStoreState((state: any) => state.settings.data?.name || 'Pterodactyl');
    
    return (
        <Wrapper>
            <BlobLeft />
            <BlobRight />
            <Container>
                <div css={tw`mb-8 flex justify-center`}>
                    {logo ? (
                        <img src={logo} alt={name} css={tw`h-12 object-contain`} />
                    ) : (
                        <svg css={tw`w-12 h-12 text-indigo-500`} viewBox="0 0 512 512" fill="currentColor">
                            <path d="M492.4 122.9c-16.1-23.7-41.5-39.6-69.8-43.1-21-2.6-42.5 1.7-61.4 12.3-15.5 8.7-28.7 21-39 35.5-12.7 18-21.7 38.6-26.6 60.1-2.3 10-3.6 20.3-4 30.7-31.5-6.6-64-8-96.1-4.2-31.3 3.8-61.7 13.5-89.9 28.5-18.7 10-36.2 22.3-51.5 36.6-13.6 12.7-25.2 27.5-34.1 43.8-7.8 14.3-13.6 29.5-17.1 45.4-2.6 11.7-3.9 23.7-3.9 35.7 0 5.4.3 10.8 1 16.2 1.3 10.3 4 20.2 8.1 29.6 5.5 12.8 13.4 24.3 23.1 33.9 12.6 12.4 28.5 21.2 45.8 25.1 14.3 3.2 29.2 3.6 43.8 1 14.4-2.6 28.2-8.2 40.5-16.5 14.2-9.5 26.3-21.6 35.5-35.7 13.9-21.4 21.9-46.1 23.3-71.7.5-8.9.1-17.8-1-26.6 19.3-10.4 39.8-18.3 61.2-23.5 18-4.3 36.6-6.7 55.4-7.2 21.3-.5 42.6 1.7 63.3 6.6 18.5 4.4 36.2 11.6 52.5 21.3 11.5 6.8 22 15 31.1 24.5 13.5 14.1 23.1 31.1 28 50.1 2.2 8.5 3.3 17.3 3.3 26.2 0 4.2-.3 8.3-.8 12.5-1 8.8-3.1 17.3-6.1 25.4-3.1 8.4-7.3 16.3-12.5 23.5-9.3 12.9-21.2 23.6-34.9 31.4-15 8.5-31.5 13.8-48.7 15.6-15 .1-30.1-2.4-44.4-7.5-13.1-4.7-25.2-11.7-35.8-20.6-11.4-9.5-20.9-21-28-34.1-11-20.2-16.5-43-16.1-66.2.3-18.2 4.1-36 11.2-52.6 3.6-8.5 8-16.6 13-24.1 7.1-10.8 15.6-20.5 25.3-28.9 22.8-19.8 50.8-33.1 81.1-38.3 12.1-2.1 24.5-2.8 36.8-2 15 .9 29.8 4 43.8 9.2 12.7 4.7 24.5 11.3 35.1 19.5 13.1 10.2 24.1 22.8 32.2 37 9.1 16 14.8 33.3 16.7 51.3 1.1 10.3 1 20.7-.3 31-1.3 10-3.9 19.7-7.7 28.9-5.3 12.8-12.7 24.6-21.9 34.7-14.7 16-32.9 28.1-53.2 35.3-20.1 7.1-41.5 9.4-62.4 6.7-19.1-2.4-37.4-8.8-54.1-18.9-15.1-9.1-28.5-21-39.2-34.9-14-18.3-23.7-39.3-28.5-61.4-2.8-12.8-3.9-25.9-3.2-39 .8-16.4 4.1-32.5 9.7-47.9 6.2-17.1 14.8-33 25.5-47.3 14.5-19.3 32.2-35.8 52.2-49 22.5-14.8 47.7-25.2 74.3-30.6 14.7-3 29.8-4.3 44.9-3.9 20.1.5 40 4.1 59 10.7 17 5.9 32.9 14.3 47.3 25.1 16 11.9 29.6 26.5 40 43.1 10 15.9 16.9 33.4 20.3 51.7 1.8 9.9 2.4 20 1.6 30-.8 9.9-2.7 19.6-5.7 28.8-4.5 13.9-11 26.8-19.3 38.3-11.8 16.2-26.6 29.8-43.5 39.8-18.1 10.7-38.1 17.5-59 19.9-20.2 2.3-40.7 1.1-60.5-3.6-18.7-4.4-36.4-12.2-52.2-22.9-16.5-11.2-30.7-25.4-41.6-41.8-14.3-21.5-23.6-45.6-27.3-71-2.1-14.2-2.5-28.7-1.1-42.9 1.7-17 5.7-33.5 11.9-49.1 7.6-18.9 17.9-36.3 30.2-51.5 15.5-19.1 34.3-35.1 55.4-46.8 23.3-12.9 49-21.3 75.8-24.8 15.2-2 30.6-2.3 45.9-.9 20.6 1.9 40.8 7 59.8 15 16.8 7.1 32.3 16.8 46.1 28.5 16.8 14.3 30.5 31.8 40.4 51.5 8.9 17.8 14.5 36.9 16.5 56.4 1 9.9 1.1 20 .2 29.9-1 10.8-3.2 21.3-6.6 31.4-4.8 14.2-11.5 27.6-20 39.8-11.1 15.9-24.6 29.7-39.8 40.7-17.6 12.8-37.3 22-58.2 27.2-20 5-40.8 6.5-61.2 4.4-20.6-2.1-40.8-7.8-59.5-16.7-17.9-8.5-34.2-20-48.1-33.9-16-16.1-28.7-35-37.6-55.8-8-18.8-13.3-38.6-15.7-59-.9-7.9-1.3-15.8-1.1-23.8.2-8.8.9-17.5 2.1-26.1 1.7-12 4.3-23.8 7.8-35.1 5.3-17.1 12.5-33.4 21.4-48.5 13.2-22.3 30.4-41.6 50.6-56.9 23-17.3 49.6-29.5 77.9-35.7 15.4-3.4 31.2-5 47-4.8 21.6.3 42.8 4.1 62.8 11.2 18.2 6.5 35.2 15.7 50.4 27.3 18.2 13.9 33.3 31.3 44 51.2 10.2 19 16.5 39.6 18.5 60.7.9 9.3.9 18.7 0 28-.9 10.3-2.9 20.4-6 30.2-4.5 14.1-10.7 27.6-18.5 40-10.4 16.6-23.4 31.3-38.3 43.1-17.4 13.8-37.2 24.1-58.4 30.2-20 5.8-41 8.1-61.6 6.8-21.4-1.3-42.3-6.5-61.8-15.3-18.6-8.4-35.5-20.1-49.8-34.4-16.4-16.4-29.4-35.8-38.3-57.2-7.8-18.8-12.8-38.5-14.8-58.7-.7-7.3-1.1-14.7-1-22.1.2-9 .8-17.9 2-26.7 1.8-12.7 4.7-25.1 8.5-37 5.9-18.4 14.1-35.8 24.2-51.8 15.1-24 34.6-44.5 57.3-60.5 25.8-18.2 55.3-30.5 86.4-36 15.8-2.8 32-4 48.2-3.4 22.8.8 45.1 5.4 65.9 13.5 19 7.4 36.6 17.6 52.3 30.3 18.3 14.7 33.5 32.6 44.5 52.8 10.5 19.3 17 40 19 61.4 1.1 11.3.8 22.7-.8 33.8z"/>
                        </svg>
                    )}
                </div>
                <Card>
                    {title && <h2 css={tw`text-2xl font-bold text-white mb-2`}>{title}</h2>}
                    {subtitle && <p css={tw`text-sm text-neutral-400 mb-8`}>{subtitle}</p>}
                    <FlashMessageRender css={tw`mb-6 px-1`} />
                    <Form {...props} ref={ref}>
                        <div css={tw`flex flex-col gap-6`}>{props.children}</div>
                    </Form>
                </Card>
                <FooterText>
                    &copy; 2023 - {new Date().getFullYear()} {name} Production
                </FooterText>
            </Container>
        </Wrapper>
    );
});
