import clsx from "clsx";
import React, { useCallback, useMemo, useState, MouseEvent, CSSProperties, ReactNode, MouseEventHandler } from "react";
import { FlowImage, FlowSelection, FlowVideo } from "scribing";
import { createUseFlowStyles } from "./JssTheming";
import { getTextStyleClassNames, textStyles } from "./utils/text-style-to-classes";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useEditMode } from "./EditModeScope";
import { useFlowCaretContext } from "./FlowCaretScope";
import { useFlowEditorController } from "./FlowEditorControllerScope";
import { UploadOverlay } from "./UploadOverlay";
import { ResizeOverlay } from "./ResizeOverlay";
import { useMediaSize } from "./hooks/use-media-size";

export interface FlowMediaViewProps {
    node: FlowImage | FlowVideo;
    selection: boolean | FlowSelection;
    outerRef: React.RefCallback<HTMLElement>;
    scale: number;
    setScale: (value: number) => void;
    children: ReactNode;
    wrapperStyle?: CSSProperties;
    wrapperClassName?: string;
    onClick?: MouseEventHandler<HTMLElement>;
    wrapperRef?: (elem: HTMLElement | null) => void;
}

export const FlowMediaView = (props: FlowMediaViewProps): JSX.Element => {
    const {
        node,
        selection,
        outerRef,
        scale,
        setScale,
        children,
        wrapperStyle,
        wrapperClassName,
        onClick: onClickProp,
        wrapperRef,
    } = props;
    const { style: givenStyle, source } = node;
    const controller = useFlowEditorController();
    const theme = useParagraphTheme();
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);
    const css = useMemo(() => getTextCssProperties(style, theme.getAmbientParagraphStyle()), [style, theme]);
    const classes = useStyles();
    const selected = selection === true;
    const editMode = useEditMode();
    const { native: nativeSelection } = useFlowCaretContext();
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const [wrapperElem, setWrapperElemCore] = useState<HTMLElement | null>(null);
    const sizeStyle = useMediaSize(source, scale);

    const setWrapperElem = useCallback((elem: HTMLElement | null) => {
        setWrapperElemCore(elem);
        wrapperRef && wrapperRef(elem);
    }, [wrapperRef]);

    const rootClassName = clsx(
        classes.root,
        ...getTextStyleClassNames(style, classes),
        selected && !nativeSelection && (editMode === "inactive" ? classes.selectedInactive : classes.selected),
    );

    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
    }, [outerRef]);
    
    const onDoubleClick = useCallback((e: MouseEvent<HTMLElement>) => {        
        const domSelection = document.getSelection();
        if (domSelection && rootElem) {
            if (domSelection.rangeCount === 0) {
                domSelection.addRange(document.createRange());
            }
            domSelection.getRangeAt(0).selectNode(rootElem);
            e.stopPropagation();
        }
    }, [rootElem]);

    const onClick = useCallback((e: MouseEvent<HTMLElement>) => {        
        const domSelection = document.getSelection();
        if (domSelection && rootElem && !e.ctrlKey && editMode) {
            const { parentElement } = rootElem;
            if (parentElement) {
                let childOffset = 0;
                for (let prev = rootElem.previousSibling; prev; prev = prev.previousSibling) {
                    ++childOffset;
                }
                const { left, width } = rootElem.getBoundingClientRect();
                if (e.clientX >= left + width / 2) {
                    ++childOffset;
                }
                if (e.shiftKey) {
                    domSelection.extend(parentElement, childOffset);
                } else {
                    domSelection.setBaseAndExtent(parentElement, childOffset, parentElement, childOffset);
                }
                e.stopPropagation();
            }
        } else if (onClickProp) {
            onClickProp(e);
        }
    }, [rootElem, editMode, onClickProp]);    

    return (
        <span 
            ref={ref}
            className={rootClassName}
            style={css}
            contentEditable={false}
            onDoubleClick={onDoubleClick}
            onClick={onClick}
            children={(
                <>
                    <span
                        ref={setWrapperElem}
                        style={{ ...wrapperStyle, ...sizeStyle }}
                        className={clsx(classes.wrapper, wrapperClassName)}
                        children={(
                            <>
                                {children}
                                <UploadOverlay
                                    uploadId={source.upload}
                                    controller={controller}
                                    type={node instanceof FlowVideo ? "video" : "image"}
                                />
                                <ResizeOverlay
                                    source={source}
                                    scale={scale}
                                    selected={selected}
                                    element={wrapperElem}
                                    setScale={setScale}
                                />
                            </>
                        )}
                    />
                </>
            )}
        />
    );
};

const useStyles = createUseFlowStyles("FlowMedia", ({palette, typography}) => ({
    ...textStyles(palette, typography),
    root: {
        display: "inline",
        position: "relative",
        outlineColor: "transparent",
        outlineStyle: "solid",
        outlineWidth: 2,
        outlineOffset: 4,
    },
    selected: {
        outlineColor: palette.selection,
    },
    selectedInactive: {
        outlineColor: palette.inactiveSelection,
    },
    wrapper: {
        display: "inline-block",
        verticalAlign: "text-bottom",
        border: "none",
        position: "relative",
    },
}));
