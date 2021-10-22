import React, { createContext, FC, ReactNode, useContext } from "react";

/**
 * @public
 */
export interface FormattingMarksScopeProps {
    show: boolean;
    children?: ReactNode;
}

/**
 * @public
 */
export const FormattingMarksScope: FC<FormattingMarksScopeProps> = ({
    show,
    children,
}) => (
    <FormattingMarksContext.Provider
        value={show}
        children={children}
    />
);

/**
 * @public
 */
export function useFormattingMarks(): boolean {
    return useContext(FormattingMarksContext);
}

const FormattingMarksContext = createContext(false);
