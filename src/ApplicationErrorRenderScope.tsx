import React, { createContext, ReactNode, useContext } from "react";

/** @public */
export interface ApplicationErrorRenderScopeProps {
    renderErrorInfo: (error: Error) => ReactNode;
    children: ReactNode;
}

/** @public */
export function ApplicationErrorRenderScope(props: ApplicationErrorRenderScopeProps): JSX.Element {
    const { renderErrorInfo, ...rest } = props;
    return <RenderErrorInfoContext.Provider value={renderErrorInfo} {...rest}/>;
}

/** @public */
export function useApplicationErrorRenderer(): ApplicationErrorRenderScopeProps["renderErrorInfo"] | null {
    return useContext(RenderErrorInfoContext);
}

const RenderErrorInfoContext = createContext<ApplicationErrorRenderScopeProps["renderErrorInfo"] | null>(null);
