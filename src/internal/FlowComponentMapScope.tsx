import React, { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { DefaultFlowComponentMap, FlowComponentMap } from "./FlowComponentMap";

/**
 * @public
 */
export interface FlowComponentMapScopeProps {
    components?: Partial<FlowComponentMap>;
    children?: ReactNode;
}

/**
 * @public
 */
export const FlowComponentMapScope: FC<FlowComponentMapScopeProps> = ({
    components: partial,
    children,
}) => {
    const components = useMemo<Readonly<FlowComponentMap>>(() => !partial ? DefaultFlowComponentMap : Object.freeze({
        ...DefaultFlowComponentMap,
        ...partial,
    }), [partial]);
    return (
        <FlowComponentMapContext.Provider
            value={components}
            children={children}
        />
    );
};

/**
 * @public
 */
export function useFlowComponentMap(): Readonly<FlowComponentMap> {
    return useContext(FlowComponentMapContext);
}

const FlowComponentMapContext = createContext<Readonly<FlowComponentMap>>(DefaultFlowComponentMap);
