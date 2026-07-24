import React, { createRef, useEffect } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';
import ReactDOM from 'react-dom';

interface Props {
    children: React.ReactNode;
    renderToggle: (onClick: (e: React.MouseEvent<any, MouseEvent>) => void) => React.ReactChild;
}

export const DropdownButtonRow = styled.button<{ danger?: boolean }>`
    ${tw`p-2 flex items-center rounded w-full text-neutral-500`};
    transition: 150ms all ease;

    &:hover {
        ${(props) => (props.danger ? tw`text-red-700 bg-red-100` : tw`text-neutral-700 bg-neutral-100`)};
    }
`;

interface State {
    posX: number;
    posY: number;
    visible: boolean;
}

class DropdownMenu extends React.PureComponent<Props, State> {
    menu = createRef<HTMLDivElement>();
    portalRoot = document.createElement('div');

    state: State = {
        posX: 0,
        posY: 0,
        visible: false,
    };

    constructor(props: Props) {
        super(props);
        document.body.appendChild(this.portalRoot);
    }

    componentWillUnmount() {
        document.body.removeChild(this.portalRoot);
        this.removeListeners();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        const menu = this.menu.current;

        if (this.state.visible && !prevState.visible && menu) {
            document.addEventListener('click', this.windowListener);
            document.addEventListener('contextmenu', this.contextMenuListener);

            let left = Math.round(this.state.posX - 12 * 16);
            if (left < 8) left = 8;
            menu.style.left = `${left}px`;
            menu.style.top = `${this.state.posY}px`;
        }

        if (!this.state.visible && prevState.visible) {
            this.removeListeners();
        }
    }

    removeListeners = () => {
        document.removeEventListener('click', this.windowListener);
        document.removeEventListener('contextmenu', this.contextMenuListener);
    };

    onClickHandler = (e: React.MouseEvent<any, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            posX: e.clientX,
            posY: e.clientY,
            visible: !this.state.visible,
        });
    };

    contextMenuListener = () => this.setState({ visible: false });

    windowListener = (e: MouseEvent) => {
        const menu = this.menu.current;

        if (e.button === 2 || !this.state.visible || !menu) {
            return;
        }

        if (menu.contains(e.target as Node)) {
            return;
        }

        this.setState({ visible: false });
    };

    render() {
        return (
            <>
                {this.props.renderToggle(this.onClickHandler)}
                {ReactDOM.createPortal(
                    <Fade timeout={150} in={this.state.visible} unmountOnExit>
                        <div
                            ref={this.menu}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            style={{ width: '12rem' }}
                            css={tw`fixed bg-neutral-800 p-2 rounded border border-neutral-600 shadow-2xl text-neutral-300 z-[9999]`}
                        >
                            {this.props.children}
                        </div>
                    </Fade>,
                    this.portalRoot
                )}
            </>
        );
    }
}

export default DropdownMenu;
