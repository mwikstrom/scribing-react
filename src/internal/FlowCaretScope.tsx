import React, { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { FlowSelection, TextStyle } from "scribing";

/**
 * @public
 */
export interface CaretStyleScopeProps {
    style: TextStyle;
    selection?: FlowSelection | null;
    children?: ReactNode;
}

/**
 * @public
 */
export const CaretStyleScope: FC<CaretStyleScopeProps> = ({
    style,
    selection,
    children,
}) => {
    const [steady, setSteady] = useState(false);    

    useEffect(() => {
        const timer = setTimeout(() => setSteady(true), 500);
        setSteady(false);
        return () => clearTimeout(timer);
    }, [selection]);

    return (
        <CaretSteadyContext.Provider value={steady}>
            <CaretStyleContext.Provider
                value={style}
                children={children}
            />
        </CaretSteadyContext.Provider>
    );
};

/**
 * @public
 */
export function useCaretStyle(): TextStyle {
    return useContext(CaretStyleContext);
}

/**
 * @public
 */
export function useIsCaretSteady(): boolean {
    return useContext(CaretSteadyContext);
}

const CaretSteadyContext = createContext(false);
const CaretStyleContext = createContext(TextStyle.empty);
