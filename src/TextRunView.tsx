import clsx from "clsx";
import React, { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { FlowRange, FlowRangeSelection, FlowSelection, TextRun } from "scribing";
import { makeJssId } from "./internal/utils/make-jss-id";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { flowNode } from "./FlowNodeComponent";
import { getTextStyleClassNames, TEXT_STYLE_CLASSES } from "./internal/utils/text-style-to-classes";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useFlowSelection } from "./FlowSelectionScope";

export const TextRunView = flowNode<TextRun>((props, ref) => {
    const { node, position } = props;
    const { text, style: givenStyle } = node;
    const theme = useParagraphTheme();
    const selection = useFlowSelection();
    const segments = useMemo(() => extractSegments(text, position, selection), [text, position, selection]);
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
            title={String(position)}
            children={segments.map(({key, value, selected}) => (
                <span
                    key={key}
                    className={clsx(classes.token, selected && classes.selected)}
                    children={value}
                />
            ))}
        />
    );
});

const useStyles = createUseStyles({
    ...TEXT_STYLE_CLASSES,
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
    },
    token: {
        "&::selection": {
            color: "currentcolor",
        }
    },
    selected: {
        color: "white",
        backgroundColor: "black",
    },
}, {
    generateId: makeJssId("TextRun"),
});

interface SegmentProps {
    key: string;
    value: string;
    selected: boolean;
}

const extractSegments = (
    text: string,
    position: number,
    selection: FlowSelection | null,
): SegmentProps[] => {
    const result: SegmentProps[] = [];
    const selectedRange = selection instanceof FlowRangeSelection 
        ? selection.range.intersect(FlowRange.at(position, text.length)) 
        : null;
    
    if (selectedRange === null || selectedRange.isCollapsed) {
        result.push({ key: "unselected", value: text, selected: false });
    } else {
        if (selectedRange.first > position) {
            result.push({ 
                key: "unselected-before",
                value: text.substr(0, selectedRange.first - position), 
                selected: false,
            });
            text = text.substr(selectedRange.first - position);
            position = selectedRange.first;
        }

        if (selectedRange.last < position + text.length) {
            result.push({ 
                key: "selected",
                value: text.substr(0, selectedRange.last - position), 
                selected: true,
            });
            result.push({ 
                key: "unselected-after",
                value: text.substr(selectedRange.last - position),
                selected: false,
            });
        } else {
            result.push({ 
                key: "selected",
                value: text, 
                selected: true,
            });
        }
    }
    
    return result;
};