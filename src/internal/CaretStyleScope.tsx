import React, { createContext, FC, ReactNode, useContext } from "react";
import { TextStyle } from "scribing";

/**
 * @public
 */
export interface CaretStyleScopeProps {
    style: TextStyle;
    children?: ReactNode;
}

/**
 * @public
 */
export const CaretStyleScope: FC<CaretStyleScopeProps> = ({
    style,
    children,
}) => (
    <CaretStyleContext.Provider
        value={style}
        children={children}
    />
);

/**
 * @public
 */
export function useCaretStyle(): TextStyle {
    return useContext(CaretStyleContext);
}

const CaretStyleContext = createContext(TextStyle.empty);
