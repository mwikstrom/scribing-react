import { Classes, Styles } from "jss";
import { ParagraphStyle, ParagraphStyleProps } from "scribing";

/** @internal */
export type ParagraphVariantRule = Exclude<ParagraphStyleProps["variant"], undefined>;

/** @internal */
export type ParagraphStyleRule = ParagraphVariantRule;

/** @internal */
export type ParagraphStyles = Styles<ParagraphStyleRule>;

/** @internal */
export type ParagraphStyleClasses = Classes<ParagraphStyleRule>;

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
    h6: {}
};

/** @internal */
export const getParagraphStyleClassNames = (
    style: ParagraphStyle,
    classes: ParagraphStyleClasses
): (string | undefined)[] => [
    classes[style.variant ?? "normal"]
];
