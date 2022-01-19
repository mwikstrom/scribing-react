import React, { createContext, FC, ReactNode, useContext } from "react";
import { FormatMarkupAttributeEvent } from "../FormatMarkupAttributeEvent";

/**
 * @internal
 */
export interface AttributeFormatterScopeProps {
    handler?: FormatMarkupAttributeEventHandler;
    children?: ReactNode;
}

/**
 * @internal
 */
export type FormatMarkupAttributeEventHandler = (event: FormatMarkupAttributeEvent) => void;

/**
 * @internal
 */
export const AttributeFormatterScope: FC<AttributeFormatterScopeProps> = ({
    handler,
    children,
}) => (
    <AttributeFormatterContext.Provider
        value={handler || VoidHandler}
        children={children}
    />
);

/**
 * @internal
 */
export function useAttributeFormatter(): FormatMarkupAttributeEventHandler {
    return useContext(AttributeFormatterContext);
}

const VoidHandler: FormatMarkupAttributeEventHandler = () => void(0);
const AttributeFormatterContext = createContext<FormatMarkupAttributeEventHandler>(VoidHandler);
