import React, { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import {
    EmptyMarkup,
    FlowContent,
    FlowCursor,
    FlowNode,
    FlowRange,
    FlowSelection,
    FlowTheme,
    ParagraphBreak,
    StartMarkup,
} from "scribing";
import { RenderableMarkup } from ".";
import { AssetLoaderScope } from "./internal/AssetLoaderScope";
import { useEditMode } from "./internal/EditModeScope";
import { FlowContentView } from "./internal/FlowContentView";
import { FlowThemeScope } from "./internal/FlowThemeScope";
import { LinkResolverScope } from "./internal/LinkResolverScope";
import { setMarkupReplacement } from "./internal/MarkupView";
import { makeJssId } from "./internal/utils/make-jss-id";
import { LoadAssetEvent } from "./LoadAssetEvent";
import { RenderMarkupEvent } from "./RenderMarkupEvent";
import { ResolveLinkEvent } from "./ResolveLinkEvent";

/**
 * Component props for {@link FlowView}
 * @public
 */
export interface FlowViewProps {
    content: FlowContent;   
    theme?: FlowTheme;
    selection?: FlowSelection | null;
    skeleton?: ReactNode;
    onLoadAsset?: (event: LoadAssetEvent) => void;
    onResolveLink?: (event: ResolveLinkEvent) => void;
    onRenderMarkup?: (event: RenderMarkupEvent) => void;
}

/**
 * Flow content view component
 * @public
 */
export const FlowView: FC<FlowViewProps> = props => {
    const {
        content: givenContent,
        theme,
        selection,
        skeleton = null,
        onLoadAsset,
        onResolveLink,
        onRenderMarkup,
    } = props;
    const editMode = useEditMode();
    const classes = useStyles();    
    const contentOrPromise = useMemo(() => {
        if (editMode || !onRenderMarkup) {
            return givenContent;
        } else {
            return processMarkup(givenContent, onRenderMarkup);
        }
    }, [givenContent, editMode, onRenderMarkup]);
    const [content, setContent] = useState<FlowContent | Promise<FlowContent> | Error>(contentOrPromise);
    useEffect(() => {
        if (isPromise(contentOrPromise)) {
            let active = true;
            contentOrPromise.then(
                result => {
                    if (active) {
                        setContent(result);
                    }
                },
                error => {
                    if (active) {
                        setContent(makeError(error));
                    }
                },
            );
            return () => { active = false; };
        }
    }, [contentOrPromise]);

    if (content instanceof Error) {
        throw content;
    }

    if (isPromise(content)) {
        return <>{skeleton}</>;
    }

    return (
        <div className={classes.root}>
            <LinkResolverScope handler={onResolveLink}>
                <AssetLoaderScope handler={onLoadAsset}>
                    <FlowThemeScope theme={theme}>
                        <FlowContentView
                            content={content}
                            selection={selection && content === givenContent ? selection : false}
                        />
                    </FlowThemeScope>
                </AssetLoaderScope>
            </LinkResolverScope>
        </div>
    );
};

const useStyles = createUseStyles({
    root: {
        counterReset: [...new Array(9)].map((_,i) => `li${i + 1} 0`).join(" "),
    },
}, {
    generateId: makeJssId("FlowView"),
});

type ParagraphMode = "empty" | "not-empty" | "omit";

const processMarkup = async (
    input: FlowContent,
    handler: (event: RenderMarkupEvent) => void,
): Promise<FlowContent> => {
    const output: FlowNode[] = [];
    await renderMarkup(input, handler, output, "empty");
    return FlowContent.fromData(output);
};

const renderMarkup = async (
    input: FlowContent,
    handler: (event: RenderMarkupEvent) => void,
    output: FlowNode[],
    mode: ParagraphMode,
): Promise<ParagraphMode> => {
    for (
        let cursor: FlowCursor | null = input.peek(0);
        cursor != null;
        cursor = cursor.moveToStartOfNextNode()
    ) {
        const { node } = cursor;
        if (node instanceof StartMarkup) {
            const end = cursor.findMarkupEnd();
            if (end === null) {
                output.push(node);
            } else {
                const start = cursor.position + node.size;
                const distance = end.position - start;
                const content = input.copy(FlowRange.at(start, distance));
                mode = await renderMarkupNode(output, mode, handler, node, content);
                cursor = end;
            }
        } else if (node instanceof EmptyMarkup) {
            mode = await renderMarkupNode(output, mode, handler, node);
        } else if (node instanceof ParagraphBreak) {
            if (mode !== "omit") {
                output.push(node);
            }
            mode = "empty";
        } else if (node !== null) {            
            output.push(node);
            mode = "not-empty";
        }
    }
    return mode;
};

const renderMarkupNode = async (
    output: FlowNode[],
    mode: ParagraphMode,
    handler: (event: RenderMarkupEvent) => void,
    node: StartMarkup | EmptyMarkup,
    content: FlowContent | null = null,
): Promise<ParagraphMode> => {
    const transform = (input: FlowContent) => processMarkup(input, handler);
    const markup = new RenderableMarkup(node, content, transform);
    const event = new RenderMarkupEvent(markup);
    handler(event);
    await event._complete();
    let { result } = event;
    if (result === undefined) {
        result = content;
    } else if (result instanceof FlowContent) {
        mode = await renderMarkup(result, handler, output, mode);
    } else if (result !== null) {
        const placeholder = new EmptyMarkup(node);
        setMarkupReplacement(placeholder, result);
        output.push(placeholder);
        return "not-empty";
    }
    return mode === "empty" ? "omit" : mode;
};

function isPromise<T = unknown>(thing: unknown): thing is Promise<T> {
    return isObjectWithProp(thing, "then") && typeof thing.then === "function";
}

function isObjectWithProp<K extends string>(thing: unknown, prop: K): thing is Record<K, unknown> {
    return typeof thing === "object" && thing !== null && prop in thing;
}

const makeError = (input: unknown): Error => input instanceof Error ? input : new Error(String(input));
