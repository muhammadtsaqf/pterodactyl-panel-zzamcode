import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
}

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    return (
        <CSSTransition timeout={150} classNames={'fade'} appear in>
            <div css={tw`flex flex-col min-h-screen`}>
                <ContentContainer css={tw`flex-1 my-4 sm:my-10`} className={className}>
                    {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                    {children}
                </ContentContainer>
                <ContentContainer css={tw`pb-6 pt-4`}>
                    <div css={tw`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center`}>
                        <p css={tw`text-neutral-500 text-xs tracking-wide`}>
                            <a
                                rel={'noopener nofollow noreferrer'}
                                href={'https://pterodactyl.io'}
                                target={'_blank'}
                                css={tw`no-underline text-neutral-500 hover:text-neutral-300 transition-colors duration-200`}
                            >
                                Pterodactyl Software
                            </a>
                            <span css={tw`text-neutral-600`}>&nbsp;© {new Date().getFullYear()}&nbsp;</span>
                            <span css={tw`text-neutral-600`}>| Modified by&nbsp;</span>
                            <a
                                rel={'noopener nofollow noreferrer'}
                                href={'https://transaksikita.com'}
                                target={'_blank'}
                                css={tw`no-underline text-neutral-500 hover:text-neutral-300 transition-colors duration-200 font-medium`}
                            >
                                zzamcode
                            </a>
                        </p>
                    </div>
                </ContentContainer>
            </div>
        </CSSTransition>
    );
};

export default PageContentBlock;
