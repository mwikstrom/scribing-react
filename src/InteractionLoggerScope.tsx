import React, { createContext, ReactNode, useContext } from "react";

/** @public */
export type InteractionLogger = Pick<typeof console, "log" | "info" | "warn" | "error">;

/** @public */
export interface InteractionLoggerScopeProps {
    logger: InteractionLogger | null;
    children?: ReactNode;
}

/** @public */
export function InteractionLoggerScope(props: InteractionLoggerScopeProps): JSX.Element {
    const { logger, children } = props;
    return <InteractionLoggerContext.Provider value={logger} children={children} />;
}

/** @public */
export function useInteractionLogger(): InteractionLogger | null {
    return useContext(InteractionLoggerContext);
}

const InteractionLoggerContext = createContext<InteractionLogger | null>(null);
