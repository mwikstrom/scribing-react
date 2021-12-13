import React, { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { DefaultFlowTypography, FlowTypography } from "./FlowTypography";

/**
 * @public
 */
export interface FlowTypographyScopeProps {
    typography?: Partial<FlowTypography>;
    children?: ReactNode;
}

/**
 * @public
 */
export const FlowTypographyScope: FC<FlowTypographyScopeProps> = ({
    typography: partial,
    children,
}) => {
    const parent = useFlowTypography();
    const typography = useMemo<Readonly<FlowTypography>>(() => !partial ? DefaultFlowTypography : Object.freeze({
        ...parent,
        ...partial,
    }), [partial]);
    return (
        <FlowTypographyContext.Provider
            value={typography}
            children={children}
        />
    );
};

/**
 * @public
 */
export function useFlowTypography(): Readonly<FlowTypography> {
    return useContext(FlowTypographyContext);
}

const FlowTypographyContext = createContext<Readonly<FlowTypography>>(DefaultFlowTypography);
