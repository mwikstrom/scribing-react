import { Classes, Styles } from "jss";
import { ParagraphStyle, ParagraphStyleProps } from "scribing";

/** @internal */
export type ParagraphVariantRule = Exclude<ParagraphStyleProps["variant"], undefined>;

/** @internal */
export type ParagraphListLevelRule = (
    "listLevel1" |
    "listLevel2" |
    "listLevel3" |
    "listLevel4" |
    "listLevel5" |
    "listLevel6" |
    "listLevel7" |
    "listLevel8" |
    "listLevel9"
);

/** @internal */
export type ParagraphListRule = (
    "listItem" |
    "hiddenListMarker" |
    ParagraphListLevelRule
);

/** @internal */
export type ParagraphStyleRule = ParagraphVariantRule | ParagraphListRule;

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
    h6: {},
    listItem: {
        display: "list-item",  
        listStylePosition: "outside",
        "&::marker": {
            whiteSpace: "pre",
        },
    },
    hiddenListMarker: {
        listStyleType: "none",
        counterIncrement: "none",
    },
    listLevel1: {
        marginLeft: "1.5rem",
        counterIncrement: "list1",
        "&::marker": {
            content: "counter(list1, decimal) '.  '"
        },
    },
    listLevel2: {
        marginLeft: "3rem",
        counterIncrement: "list2",
    },
    listLevel3: {
        marginLeft: "4.5rem",
        counterIncrement: "list3",
    },
    listLevel4: {
        marginLeft: "6rem",
        counterIncrement: "list4",
    },
    listLevel5: {
        marginLeft: "7.5rem",
        counterIncrement: "list5",
    },
    listLevel6: {
        marginLeft: "9rem",
        counterIncrement: "list6",
    },
    listLevel7: {
        marginLeft: "11.5rem",
        counterIncrement: "list7",
    },
    listLevel8: {
        marginLeft: "13rem",
        counterIncrement: "list8",
    },
    listLevel9: {
        marginLeft: "14.5rem",
        counterIncrement: "list9",
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
        hideListMarker = false,
    } = style;
    const result = [classes[variant]];

    if (listLevel > 0) {
        result.push(classes.listItem);
        result.push(classes[getListLevelRule(listLevel)]);
        if (hideListMarker) {
            result.push(classes.hiddenListMarker);
        }
    }

    return result;
};

export const getListLevelRule = (level: number): ParagraphListLevelRule => {
    const normalized = level as (1|2|3|4|5|6|7|8|9);
    return `listLevel${normalized}` as const;
};
