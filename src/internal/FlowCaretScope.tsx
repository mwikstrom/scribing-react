import React, { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { FlowSelection, TextStyle } from "scribing";

/**
 * @internal
 */
export interface FlowCaretScopeProps {
    style?: TextStyle;
    selection?: FlowSelection | null;
    children?: ReactNode;
    native?: boolean;
}

/**
 * @internal
 */
export interface FlowCaretContextValue {
    readonly style: TextStyle;
    readonly steady: boolean;
    readonly native: boolean;
}

/**
 * @internal
 */
export const FlowCaretScope: FC<FlowCaretScopeProps> = ({
    style = TextStyle.empty,
    selection,
    native = false,
    children,
}) => {
    const [steady, setSteady] = useState(false);
    const value = useMemo<FlowCaretContextValue>(() => ({
        style,
        steady,
        native,
    }), [style, steady, native]);

    useEffect(() => {
        const timer = setTimeout(() => setSteady(true), 500);
        setSteady(false);
        return () => clearTimeout(timer);
    }, [selection]);

    return (
        <FlowCaretContext.Provider
            value={value}
            children={children}
        />
    );
};

/**
 * @internal
 */
export function useFlowCaretContext(): FlowCaretContextValue {
    return useContext(FlowCaretContext);
}

const DEFAULT_VALUE: FlowCaretContextValue = Object.freeze({
    style: TextStyle.empty,
    steady: false,
    native: false,
});

const FlowCaretContext = createContext(DEFAULT_VALUE);
