import clsx from "clsx";
import React, { 
    useCallback, 
    useMemo, 
    useState, 
    MouseEvent, 
    FC, 
    RefCallback,
    useRef
} from "react";
import { EmptyMarkup, EndMarkup, Script, StartMarkup } from "scribing";
import { FlowNodeComponentProps } from "./FlowNodeComponent";
import { getTextCssProperties } from "./utils/text-style-to-css";
import { useParagraphTheme } from "./ParagraphThemeScope";
import { useFlowCaretContext } from "./FlowCaretScope";
import { useEditMode } from "./EditModeScope";
import { ScriptEvalScope } from "./hooks/use-script-eval-props";
import { useMarkupStyles } from "./MarkupStyles";
import { mapDomPositionToFlow } from "./mapping/dom-position-to-flow";
import { useFlowEditorController } from "./FlowEditorControllerScope";
import { createFlowSelection } from "./mapping/dom-selection-to-flow";
import { RenderMarkupTagEvent } from "../RenderMarkupTagEvent";
import { useMarkupTagRenderHandler } from "./MarkupTagRenderScope";
import { MarkupAttributeValue } from "./MarkupAttributeValue";
import { registerBreakOutNode } from "./utils/break-out";
import { findMappedEditingHost } from "./mapping/flow-editing-host";

export interface MarkupViewProps extends Omit<FlowNodeComponentProps<StartMarkup | EmptyMarkup | EndMarkup>, "ref"> {
    outerRef: RefCallback<HTMLElement>;
}

export const MarkupEditView: FC<MarkupViewProps> = props => {
    const { node, opposingTag, selection, outerRef } = props;
    const { style: givenStyle, tag } = node;
    const attr = node instanceof EndMarkup ? null : node.attr;
    const theme = useParagraphTheme();
    const classes = useMarkupStyles();
    const selected = selection === true;
    const editMode = useEditMode();
    const { native: nativeSelection } = useFlowCaretContext();
    const handler = useMarkupTagRenderHandler();
    const controller = useFlowEditorController();
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const rootElemRef = useRef<HTMLElement | null>(null);

    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);

    const evalScope: ScriptEvalScope = { textStyle: style };

    const css = useMemo(() => {
        const { 
            fontSize: styledFontSize, 
            verticalAlign
        } = getTextCssProperties(style, theme.getAmbientParagraphStyle());
        const MAX_FONT_SIZE = "0.75rem";
        const fontSize = styledFontSize ? `calc(min(${styledFontSize}, ${MAX_FONT_SIZE}))` : MAX_FONT_SIZE;
        return { fontSize, verticalAlign };
    }, [style, theme]);
    
    const onChangeAttr = useCallback((key: string, value: string | Script | null): boolean => {
        try {
            if (!rootElemRef.current || !controller) {
                return false;
            }

            const editingHost = findMappedEditingHost(rootElemRef.current);

            if (!editingHost) {
                return false;
            }

            const flowPath = mapDomPositionToFlow(rootElemRef.current, 0, editingHost);

            if (!flowPath) {
                return false;
            }

            const flowSelection = createFlowSelection(flowPath, 1);
            
            const change = value === null 
                ? flowSelection.unsetMarkupAttr(controller.state.content, key)
                : flowSelection.setMarkupAttr(controller.state.content, key, value);

            if (change === null) {
                return false;
            }
            
            controller._apply(change);
            return true;
        } catch (error) {
            console.error("Failed set markup attribute", error);
            return false;
        }
    }, [controller]);

    const { content: customContent, block } = useMemo(() => {
        if (attr) {
            const event = new RenderMarkupTagEvent(tag, attr, onChangeAttr);
            handler(event);
            return event;
        } else {
            return { content: undefined, block: false };
        }
    }, [handler, tag, attr, onChangeAttr]);

    const className = clsx(
        classes.root,
        block && classes.block,
        selected && !nativeSelection && (editMode === "inactive" ? classes.selectedInactive : classes.selected),
        node instanceof StartMarkup && classes.startTag,
        node instanceof EndMarkup && classes.endTag,
        node instanceof EmptyMarkup && classes.emptyTag,
        (node instanceof StartMarkup || node instanceof EndMarkup) && !opposingTag && classes.broken,
    );

    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
        rootElemRef.current = dom;
        if (customContent) {
            registerBreakOutNode(dom);
        }
    }, [outerRef, customContent]);

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
        }
    }, [rootElem, editMode]);

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

    return (
        <span
            ref={ref}
            className={className}
            style={css}
            contentEditable={false}
            spellCheck={false}
            onClick={customContent === undefined ? onClick : undefined}
            onDoubleClick={customContent === undefined ? onDoubleClick : undefined}
            children={customContent !== undefined ? customContent : (
                <>
                    {tag}
                    {attr && Array.from(attr).map(([key, value]) => (
                        <span key={key}>
                            {` ${key}`}
                            <span className={classes.syntax}>=</span>
                            <MarkupAttributeValue tag={tag} name={key} value={value} evalScope={evalScope}/>
                        </span>
                    ))}
                </>
            )}
        />
    );
};
