import React, { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { DefaultFlowPalette, FlowPalette } from "./FlowPalette";

/**
 * @public
 */
export interface FlowPaletteScopeProps {
    palette?: Partial<FlowPalette>;
    children?: ReactNode;
}

/**
 * @public
 */
export const FlowPaletteScope: FC<FlowPaletteScopeProps> = ({
    palette: partial,
    children,
}) => {
    const parent = useFlowPalette();
    const palette = useMemo<Readonly<FlowPalette>>(() => !partial ? DefaultFlowPalette : Object.freeze({
        ...parent,
        ...partial,
    }), [partial]);
    return (
        <FlowPaletteContext.Provider
            value={palette}
            children={children}
        />
    );
};

/**
 * @public
 */
export function useFlowPalette(): Readonly<FlowPalette> {
    return useContext(FlowPaletteContext);
}

const FlowPaletteContext = createContext<Readonly<FlowPalette>>(DefaultFlowPalette);
