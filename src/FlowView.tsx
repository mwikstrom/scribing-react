import clsx from "clsx";
import React, { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import {
    FlowContent,
    FlowSelection,
    FlowTheme,
    MarkupHandler,
    MarkupProcessingScope,
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
import { useIsInsideSharedListCounterScope } from "./SharedListCounterScope";
import { processMarkup as processMarkupCore } from "scribing";

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
            return processMarkup(content, onRenderMarkup, null);
        }
    }, [content, editMode, onRenderMarkup]);
    const [resolved, setResolved] = useState<FlowContent | Error | null>(null);
    const [root, setRoot] = useState<HTMLElement | null>(null);
    const [blockSize, setBlockSize] = useState<number | null>(null);
    const sharedListCounter = useIsInsideSharedListCounterScope();
    const className = clsx(classes.root, sharedListCounter && classes.sharedListCounter);

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
        <div className={className} ref={setRoot}>
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
        "&$sharedListCounter": {
            counterReset: [...new Array(8)].map((_,i) => `li${i + 2} 0`).join(" "),
        }
    },
    sharedListCounter: {},
}, {
    generateId: makeJssId("FlowView"),
});

const processMarkup = (
    content: FlowContent,
    handler: (event: RenderMarkupEvent) => void,
    parent: MarkupProcessingScope | null,
): Promise<FlowContent> => {
    const coreHandler = makeCoreHandler(handler);
    return processMarkupCore(content, coreHandler, setMarkupReplacement, parent);
};

const makeCoreHandler = (handler: (event: RenderMarkupEvent) => void): MarkupHandler<ReactNode> => async input => {
    const markup = new RenderableMarkup(input);
    const event = new RenderMarkupEvent(markup);
    handler(event);
    await event._complete();
    return event.result;
};

const makeError = (input: unknown): Error => input instanceof Error ? input : new Error(String(input));
