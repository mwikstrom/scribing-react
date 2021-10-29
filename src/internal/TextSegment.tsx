import clsx from "clsx";
import React, { FC, useEffect, useMemo, useState } from "react";
import { TextStyle } from "scribing";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { useParagraphTheme } from "./ParagraphThemeScope";

export interface TextSegmentProps {
    text: string;
    style: TextStyle;
    selected?: boolean;
}

export const TextSegment: FC<TextSegmentProps> = props => {
    const { text, selected, style: givenStyle } = props;
    const theme = useParagraphTheme();
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);
    const css = useMemo(() => getTextCssProperties(style, theme.getAmbientParagraphStyle()), [style, theme]);
    const classes = useStyles();
    const className = useMemo(
        () => clsx(classes.root, selected && classes.selected, ...getTextStyleClassNames(style, classes)),
        [style, classes, selected]
    );
    const [spellCheck, setSpellCheck] = useState(false);
    // Enable spell checker only after text has been idle for a while
    useEffect(() => {
        setSpellCheck(false);
        if (style.spellcheck) {
            const timeout = setTimeout(() => setSpellCheck(true), 500);
            return () => clearTimeout(timeout);
        }
    }, [text, style.spellcheck]);
    return (
        <span
            className={className}
            style={css}
            children={text || "\u200b"}
            spellCheck={spellCheck}
        />
    );
};

const useStyles = createUseFlowStyles("TextSegment", ({palette}) => ({
    ...textStyles(palette),
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
    },
    selected: {}
}));
