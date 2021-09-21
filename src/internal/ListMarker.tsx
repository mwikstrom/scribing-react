import clsx from "clsx";
import React, { FC, useMemo } from "react";
import { createUseStyles } from "react-jss";
import { ListMarkerKind, TextStyle } from "scribing";
import { makeJssId } from "./utils/make-jss-id";
import { listIndent } from "./utils/paragraph-style-to-classes";
import { getTextStyleClassNames, TEXT_STYLE_CLASSES } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";

/** @internal */
export interface ListMarkerProps {
    level?: number;
    kind?: ListMarkerKind;
    hide?: boolean;
    counter?: number | "auto" | "resume";
    prefix?: string;
    suffix?: string;
    style?: TextStyle;
}

/** @internal */
export const ListMarker: FC<ListMarkerProps> = props => {
    const {
        level = 0,
        kind = "unordered",
        hide = false,
        counter = "auto",
        prefix = "",
        suffix = ". ",
        style = TextStyle.empty,
    } = props;
    const css = useMemo(() => getTextCssProperties(style), [style]);
    const classes = useStyles();
    const className = useMemo(
        () => clsx(classes.root, ...getTextStyleClassNames(style, classes)),
        [style, classes]
    );
    return (
        <span
            contentEditable={false}
            className={className}
            style={css}
            children={"x"}
        />
    );
};

const useStyles = createUseStyles({
    ...TEXT_STYLE_CLASSES,
    root: {
        userSelect: "none",
        display: "inline-block",
        minWidth: listIndent(1),
        whiteSpace: "pre",
        textAlign: "start",
    },
}, {
    generateId: makeJssId("ListMarker"),
});
