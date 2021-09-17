import React, { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { TextRun } from "scribing";
import { makeJssId } from "./internal/utils/make-jss-id";
import { getTextCssProperties } from "./internal/utils/text-style-to-css";
import { FlowNodeComponent } from "./FlowNodeComponent";

export const TextRunView: FlowNodeComponent<TextRun> = props => {
    const { node, ref, theme } = props;
    const { text, style } = node;
    const css = useMemo(
        () => getTextCssProperties(theme.getAmbientTextStyle().merge(style)),
        [style, theme]
    );
    const classes = useStyles();
    return (
        <span
            ref={ref}
            className={classes.root}
            style={css}
            children={text}
        />
    );
};

const useStyles = createUseStyles({
    root: {
        whiteSpace: "pre-wrap", // Preserve white space, wrap as needed
    },
}, {
    generateId: makeJssId("TextRun"),
});
