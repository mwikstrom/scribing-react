import React, { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { DefaultFlowLocale, FlowLocale } from "./FlowLocale";

/**
 * @public
 */
export interface FlowLocaleScopeProps {
    locale?: Partial<FlowLocale>;
    children?: ReactNode;
}

/**
 * @public
 */
export const FlowLocaleScope: FC<FlowLocaleScopeProps> = ({
    locale: partial,
    children,
}) => {
    const locale = useMemo<Readonly<FlowLocale>>(() => !partial ? DefaultFlowLocale : Object.freeze({
        ...DefaultFlowLocale,
        ...partial,
    }), [partial]);
    return (
        <FlowLocaleContext.Provider
            value={locale}
            children={children}
        />
    );
};

/**
 * @public
 */
export function useFlowLocale(): Readonly<FlowLocale> {
    return useContext(FlowLocaleContext);
}

const FlowLocaleContext = createContext<Readonly<FlowLocale>>(DefaultFlowLocale);
