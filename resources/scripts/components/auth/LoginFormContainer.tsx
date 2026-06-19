import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
        max-width: 700px;
    `};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Container>
        {title && <h2 css={tw`text-3xl text-center text-neutral-100 font-medium py-4`}>{title}</h2>}
        <FlashMessageRender css={tw`mb-2 px-1`} />
        <Form {...props} ref={ref}>
            <div 
                css={tw`w-full p-8 mx-auto relative`}
                style={{ 
                    background: 'rgba(15, 23, 42, 0.6)', 
                    backdropFilter: 'blur(16px)', 
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div css={tw`mb-8 flex justify-center`}>
                    <img src={'/assets/svgs/pterodactyl.svg'} css={tw`w-40 md:w-56 drop-shadow-lg`} />
                </div>
                <div css={tw`flex-1`}>{props.children}</div>
            </div>
        </Form>
        <p css={tw`text-center text-neutral-500 text-xs mt-4`}>
            &copy; 2015 - {new Date().getFullYear()}&nbsp;
            <a
                rel={'noopener nofollow noreferrer'}
                href={'https://pterodactyl.io'}
                target={'_blank'}
                css={tw`no-underline text-neutral-500 hover:text-neutral-300`}
            >
                Pterodactyl Software
            </a>
        </p>
    </Container>
));
