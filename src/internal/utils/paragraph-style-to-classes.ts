import { Classes, Styles } from "jss";
import { ParagraphStyle, ParagraphStyleProps } from "scribing";
import { toRem } from "./css-values";

/** @internal */
export type ParagraphVariantRule = Exclude<ParagraphStyleProps["variant"], undefined>;

/** @internal */
export type ParagraphListLevelRule = (
    "li1" |
    "li2" |
    "li3" |
    "li4" |
    "li5" |
    "li6" |
    "li7" |
    "li8" |
    "li9"
);

/** @internal */
export type ParagraphListRule = (
    "li" |
    ParagraphListLevelRule
);

/** @internal */
export type ParagraphStyleRule = ParagraphVariantRule | ParagraphListRule;

/** @internal */
export type ParagraphStyles = Styles<ParagraphStyleRule>;

/** @internal */
export type ParagraphStyleClasses = Classes<ParagraphStyleRule>;

/** @internal */
export const LIST_LEVEL_INDENT_SIZE = 2;

/** @internal */
export const listIndent = (level: number): string => toRem(level * LIST_LEVEL_INDENT_SIZE);

/** @internal */
export const PARAGRAPH_STYLE_CLASSES: ParagraphStyles = {
    normal: {},
    preamble: {},
    title: {},
    subtitle: {},
    code: {},
    h1: {},
    h2: {},
    h3: {},
    h4: {},
    h5: {},
    h6: {},
    li: {
        textIndent: listIndent(-1),
    },
    li1: {
        paddingInlineStart: listIndent(1),
    },
    li2: {
        paddingInlineStart: listIndent(2),
    },
    li3: {
        paddingInlineStart: listIndent(3),
    },
    li4: {
        paddingInlineStart: listIndent(4),
    },
    li5: {
        paddingInlineStart: listIndent(5),
    },
    li6: {
        paddingInlineStart: listIndent(6),
    },
    li7: {
        paddingInlineStart: listIndent(7),
    },
    li8: {
        paddingInlineStart: listIndent(8),
    },
    li9: {
        paddingInlineStart: listIndent(9),
    },
};

/** @internal */
export const getParagraphStyleClassNames = (
    style: ParagraphStyle,
    classes: ParagraphStyleClasses
): string[] => {
    const { 
        variant = "normal",
        listLevel = 0,
    } = style;
    const result = [classes[variant]];

    if (listLevel > 0) {
        result.push(classes.li);
        result.push(classes[getListLevelRule(listLevel)]);
    }

    return result;
};

export const getListLevelRule = (level: number): ParagraphListLevelRule => {
    const normalized = level as (1|2|3|4|5|6|7|8|9);
    return `li${normalized}` as const;
};
