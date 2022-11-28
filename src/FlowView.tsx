import React, { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import {
    AsyncFlowNodeVisitor,
    EmptyMarkup,
    FlowBox,
    FlowContent,
    FlowCursor,
    FlowNode,
    FlowRange,
    FlowSelection,
    FlowTheme,
    ParagraphBreak,
    StartMarkup,
} from "scribing";
import { FormatMarkupAttributeEvent } from "./FormatMarkupAttributeEvent";
import { AssetLoaderScope } from "./internal/AssetLoaderScope";
import { AttributeFormatterScope } from "./internal/AttributeFormatterScope";
import { BlockSizeScope } from "./internal/BlockSize";
import { useEditMode } from "./internal/EditModeScope";
import { FlowContentView } from "./internal/FlowContentView";
import { FlowThemeScope } from "./internal/FlowThemeScope";
import { LinkResolverScope } from "./internal/LinkResolverScope";
import { setMarkupReplacement } from "./internal/MarkupView";
import { makeJssId } from "./internal/utils/make-jss-id";
import { LoadAssetEvent } from "./LoadAssetEvent";
import { RenderableMarkup } from "./RenderableMarkup";
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
    onFormatMarkupAttribute?: (event: FormatMarkupAttributeEvent) => void;
}

/**
 * Flow content view component
 * @public
 */
export const FlowView: FC<FlowViewProps> = props => {
    const {
        content,
        theme,
        selection,
        skeleton = null,
        onLoadAsset,
        onResolveLink,
        onRenderMarkup,
        onFormatMarkupAttribute,
    } = props;
    const editMode = useEditMode();
    const classes = useStyles();    
    const deferred = useMemo(() => {
        if (editMode || !onRenderMarkup) {
            return null;
        } else {
            return processMarkup(content, onRenderMarkup);
        }
    }, [content, editMode, onRenderMarkup]);
    const [resolved, setResolved] = useState<FlowContent | Error | null>(null);
    const [root, setRoot] = useState<HTMLElement | null>(null);
    const [blockSize, setBlockSize] = useState<number | null>(null);

    useEffect(() => {
        if (root) {
            setBlockSize(root.clientWidth);
            const observer = new ResizeObserver(entries => entries.forEach(entry => {
                setBlockSize(entry.contentRect.width);
            }));
            observer.observe(root);
            return () => observer.disconnect();
        } else {
            setBlockSize(null);
        }
    }, [root]);

    useEffect(() => {
        setResolved(null);
        if (deferred) {
            let active = true;
            deferred.then(
                result => {
                    if (active) {
                        setResolved(result);
                    }
                },
                error => {
                    if (active) {
                        setResolved(makeError(error));
                    }
                },
            );
            return () => { active = false; };
        }
    }, [deferred]);

    if (resolved instanceof Error) {
        throw resolved;
    }

    if (deferred && !resolved) {
        return <>{skeleton}</>;
    }

    return (
        <div className={classes.root} ref={setRoot}>
            <LinkResolverScope handler={onResolveLink}>
                <AssetLoaderScope handler={onLoadAsset}>
                    <AttributeFormatterScope handler={onFormatMarkupAttribute}>
                        <FlowThemeScope theme={theme}>
                            <BlockSizeScope value={blockSize}>
                                <FlowContentView
                                    content={resolved ?? content}
                                    selection={selection && !deferred ? selection : false}
                                />
                            </BlockSizeScope>
                        </FlowThemeScope>
                    </AttributeFormatterScope>
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

const EMPTY_SCOPE: readonly (StartMarkup | EmptyMarkup)[] = Object.freeze([]);
const processMarkup = async (
    input: FlowContent,
    handler: (event: RenderMarkupEvent) => void,
    scope: readonly (StartMarkup | EmptyMarkup)[] = EMPTY_SCOPE,
): Promise<FlowContent> => {
    const output: FlowNode[] = [];
    await renderMarkup(input, handler, scope, output, "empty");
    return FlowContent.fromData(output);
};

const renderMarkup = async (
    input: FlowContent,
    handler: (event: RenderMarkupEvent) => void,
    scope: readonly (StartMarkup | EmptyMarkup)[],
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
                mode = await renderMarkupNode(output, mode, handler, node, scope, content);
                cursor = end;
            }
        } else if (node instanceof EmptyMarkup) {
            mode = await renderMarkupNode(output, mode, handler, node, scope);
        } else if (node instanceof ParagraphBreak) {
            if (mode !== "omit") {
                output.push(node);
            }
            mode = "empty";
        } else if (node instanceof FlowBox) {
            const content = await processMarkup(node.content, handler, scope);
            output.push(node.set("content", content));
            mode = "not-empty";
        } else if (node !== null) {
            output.push(await new MarkupProcessor(handler, scope).visitNode(node));
            mode = "not-empty";
        }
    }
    return mode;
};

class MarkupProcessor extends AsyncFlowNodeVisitor {
    readonly #handler: (event: RenderMarkupEvent) => void;
    readonly #scope: readonly (StartMarkup | EmptyMarkup)[];

    constructor(
        handler: (event: RenderMarkupEvent) => void,
        scope: readonly (StartMarkup | EmptyMarkup)[],
    ) {
        super();
        this.#handler = handler;
        this.#scope = scope;
    }

    override visitFlowContent(content: FlowContent): Promise<FlowContent> {
        return processMarkup(content, this.#handler, this.#scope);
    }
}

const renderMarkupNode = async (
    output: FlowNode[],
    mode: ParagraphMode,
    handler: (event: RenderMarkupEvent) => void,
    node: StartMarkup | EmptyMarkup,
    scope: readonly (StartMarkup | EmptyMarkup)[],
    content: FlowContent | null = null,
): Promise<ParagraphMode> => {
    const transform = (input: FlowContent) => processMarkup(input, handler, [node, ...scope]);
    const markup = new RenderableMarkup(node, content, transform);
    const event = new RenderMarkupEvent(markup, scope);
    handler(event);
    await event._complete();
    let { result } = event;
    
    if (result === undefined) {
        result = content;
    }
    
    if (result instanceof FlowContent) {
        mode = await renderMarkup(result, handler, [node, ...scope], output, mode);
    } else if (result !== null) {
        // Register replacement React node. The flow markup node must be given a replacement tag name
        // so that it is not equal to the flow node being replaced. Prior to 1.1.3 we kept the old tag
        // name causing the replacement flow node to be considered equal to the replaced node which in
        // turn kicked in the "keep unchanged"-logic when replacing flow box content in `renderMarkup`
        // above (line 189: `output.push(node.set("content", content));`)
        const placeholder = new EmptyMarkup(node).set("tag", `REPLACEMENT_${node.tag}`);
        setMarkupReplacement(placeholder, result);
        output.push(placeholder);
        return "not-empty";
    }
    return mode === "empty" ? "omit" : mode;
};

const makeError = (input: unknown): Error => input instanceof Error ? input : new Error(String(input));
