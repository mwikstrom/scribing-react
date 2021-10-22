import React, { createContext, FC, ReactNode, useContext } from "react";
import { DefaultFlowTheme, ParagraphTheme } from "scribing";

/**
 * @public
 */
export interface ParagraphThemeScopeProps {
    theme?: ParagraphTheme;
    children?: ReactNode;
}

/**
 * @public
 */
export const ParagraphThemeScope: FC<ParagraphThemeScopeProps> = ({
    theme = defaultParagraphTheme,
    children,
}) => (
    <ParagraphThemeContext.Provider
        value={theme}
        children={children}
    />
);

/**
 * @public
 */
export function useParagraphTheme(): ParagraphTheme {
    return useContext(ParagraphThemeContext);
}

const defaultParagraphTheme = DefaultFlowTheme.instance.getParagraphTheme("normal");
const ParagraphThemeContext = createContext(defaultParagraphTheme);
