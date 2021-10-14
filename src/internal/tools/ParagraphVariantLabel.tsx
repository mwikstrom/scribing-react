import React, { FC } from "react";
import { getParagraphVariantLocaleKey, useFlowLocale } from "../..";
import { ParagraphStyleVariant } from "scribing";
import { createUseStyles } from "react-jss";
import { makeJssId } from "../utils/make-jss-id";
import clsx from "clsx";

export interface ParagraphVariantLabelProps {
    variant: ParagraphStyleVariant;
    collapsed?: boolean;
}

export const ParagraphVariantLabel: FC<ParagraphVariantLabelProps> = ({variant, collapsed}) => {
    const locale = useFlowLocale();
    const classes = useStyles();
    const localeKey = getParagraphVariantLocaleKey(variant);
    const label = locale[localeKey];
    const className = clsx(classes.root, collapsed && classes.collapsed);
    return <div className={className}>{label}</div>;
};

const useStyles = createUseStyles({
    root: {
        padding: "0 0.5rem",
        overflow: "hidden",
    },
    collapsed: {
        height: 0,
    },
}, {
    generateId: makeJssId("ParagraphVariantLabel"),
});