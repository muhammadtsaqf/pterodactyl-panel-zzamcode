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
                        <img src={logo} alt={name} css={tw`w-32 md:w-40 drop-shadow-lg object-contain`} />
                    ) : (
                        <img src={'/assets/svgs/pterodactyl.svg'} alt={name} css={tw`w-32 md:w-40 drop-shadow-lg`} />
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
                    <a
                        rel={'noopener nofollow noreferrer'}
                        href={'https://pterodactyl.io'}
                        target={'_blank'}
                        css={tw`no-underline text-neutral-500 hover:text-neutral-300 transition-colors`}
                    >
                        Pterodactyl Software
                    </a>
                    &nbsp;&copy; {new Date().getFullYear()} | Modified by&nbsp;
                    <a
                        rel={'noopener nofollow noreferrer'}
                        href={'https://transaksikita.com'}
                        target={'_blank'}
                        css={tw`no-underline text-neutral-500 hover:text-neutral-300 transition-colors`}
                    >
                        zzamcode
                    </a>
                </FooterText>
            </Container>
        </Wrapper>
    );
});
