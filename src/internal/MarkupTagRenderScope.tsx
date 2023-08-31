import React, { createContext, FC, ReactNode, useContext } from "react";
import { RenderMarkupTagEvent } from "../RenderMarkupTagEvent";

/**
 * @internal
 */
export interface MarkupTagRenderScopeProps {
    handler?: RenderMarkupTagEventHandler;
    children?: ReactNode;
}

/**
 * @internal
 */
export type RenderMarkupTagEventHandler = (event: RenderMarkupTagEvent) => void;

/**
 * @internal
 */
export const MarkupTagRenderScope: FC<MarkupTagRenderScopeProps> = ({
    handler,
    children,
}) => (
    <MarkupTagRenderContext.Provider
        value={handler || VoidHandler}
        children={children}
    />
);

/**
 * @internal
 */
export function useMarkupTagRenderHandler(): RenderMarkupTagEventHandler {
    return useContext(MarkupTagRenderContext);
}

const VoidHandler: RenderMarkupTagEventHandler = () => void(0);
const MarkupTagRenderContext = createContext<RenderMarkupTagEventHandler>(VoidHandler);
