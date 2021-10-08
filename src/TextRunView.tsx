import clsx from "clsx";
import React, { useMemo } from "react";
import { TextRun } from "scribing";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";
import { createUseFlowStyles } from "./internal/JssTheming";
import { getTextStyleClassNames, textStyles } from "./internal/utils/text-style-to-classes";
import { useParagraphTheme } from "./ParagraphThemeScope";

export const TextRunView = flowNode<TextRun>((props, ref) => {
    const { node } = props;
    const { text, style: givenStyle } = node;
    const theme = useParagraphTheme();
    const segments = useMemo(() => extractSegments(text), [text]);
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
    return (
        <span
            ref={ref}
            className={className}
            style={css}
            children={segments.map(({key, value}) => (
                <span
                    key={key}
                    children={value}
                />
            ))}
        />
    );
});

const useStyles = createUseFlowStyles("TextRun", ({palette}) => ({
    ...textStyles(palette),
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
    },
}));

interface SegmentProps {
    key: number;
    value: string;
}

const extractSegments = (
    text: string,
): SegmentProps[] => {
    const result: SegmentProps[] = [];
    result.push({key: 0, value: text});
    return result;
};