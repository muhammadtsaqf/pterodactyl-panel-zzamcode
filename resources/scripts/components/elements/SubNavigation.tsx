import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full shadow-sm overflow-x-auto`};
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    /* Hide scrollbar for smooth mobile experience */
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;

    & > div {
        ${tw`flex items-center text-sm px-4 md:px-8 min-w-max`};

        & > a,
        & > div {
            ${tw`inline-block py-3 px-4 text-neutral-400 no-underline whitespace-nowrap transition-all duration-300 relative`};

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                ${tw`text-neutral-100`};
            }

            &:active,
            &.active {
                ${tw`text-white font-medium`};
            }
            
            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #3b82f6, #6366f1);
                opacity: 0;
                transition: opacity 0.3s ease;
                box-shadow: 0 -2px 10px rgba(59, 130, 246, 0.5);
            }

            &:hover::after,
            &.active::after {
                opacity: 1;
            }
        }
    }
`;

export default SubNavigation;
