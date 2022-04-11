import React, { createContext, ReactNode, useContext } from "react";

/** @internal */
export interface BlockSizeScopeProps {
    value: number | null,
    children: ReactNode;
}

/** @internal */
export const BlockSizeScope = (props: BlockSizeScopeProps): JSX.Element => {
    const { value, children } = props;
    return (
        <BlockSizeContext.Provider
            value={value === null ? "100%" : `${value}px`}
            children={children}
        />
    );
};

/** @internal */
export interface ReducedBlockSizeScopeProps {
    decrement: string | undefined,
    children: ReactNode;
}

/** @internal */
export const ReducedBlockSizeScope = (props: ReducedBlockSizeScopeProps): JSX.Element => {
    const { decrement, children } = props;
    const outer = useBlockSize();
    return (
        <BlockSizeContext.Provider
            value={decrement ? `calc(${outer} - ${decrement})` : outer}
            children={children}
        />
    );
};

/** @internal */
export const useBlockSize = (): string => useContext(BlockSizeContext);

const BlockSizeContext = createContext<string>("100%");
