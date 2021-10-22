import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import { TextRun } from "scribing";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { useParagraphTheme } from "./ParagraphThemeScope";

export const TextRunView = flowNode<TextRun>((props, ref) => {
    const { node } = props;
    const { text, style: givenStyle } = node;
    const theme = useParagraphTheme();
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);
    const css = useMemo(() => getTextCssProperties(style), [style]);
    const classes = useStyles();
    const className = useMemo(
        () => clsx(classes.root, ...getTextStyleClassNames(style, classes)),
        [style, classes]
    );

    // Enable spell checker only after text has been idle for a while
    const [spellCheck, setSpellCheck] = useState(false);
    useEffect(() => {
        const timeout = setTimeout(() => setSpellCheck(true), 250);
        setSpellCheck(false);
        return () => clearTimeout(timeout);
    }, [text]);

    return (
        <span
            ref={ref}
            className={className}
            style={css}
            spellCheck={spellCheck}
            children={text}
        />
    );
});

const useStyles = createUseFlowStyles("TextRun", ({palette}) => ({
    ...textStyles(palette),
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
    },
}));
