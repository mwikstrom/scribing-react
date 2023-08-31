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
import { MarkupTagContent } from "./MarkupTagContent";
import { mapDomPositionToFlow } from "./mapping/dom-position-to-flow";
import { useEditingHost } from "./EditingHostScope";
import { useFlowEditorController } from "./FlowEditorControllerScope";
import { createFlowSelection } from "./mapping/dom-selection-to-flow";

export interface MarkupViewProps extends Omit<FlowNodeComponentProps<StartMarkup | EmptyMarkup | EndMarkup>, "ref"> {
    outerRef: RefCallback<HTMLElement>;
}

export const MarkupEditView: FC<MarkupViewProps> = props => {
    const { node, opposingTag, selection, outerRef } = props;
    const { style: givenStyle, tag } = node;
    const attr = node instanceof EndMarkup ? null : node.attr;
    const theme = useParagraphTheme();
    const style = useMemo(() => {
        let ambient = theme.getAmbientTextStyle();
        if (givenStyle.link) {
            ambient = ambient.merge(theme.getLinkStyle());
        }
        return ambient.merge(givenStyle);
    }, [givenStyle, theme]);
    const css = useMemo(() => {
        const { 
            fontSize: styledFontSize, 
            verticalAlign
        } = getTextCssProperties(style, theme.getAmbientParagraphStyle());
        const MAX_FONT_SIZE = "0.75rem";
        const fontSize = styledFontSize ? `calc(min(${styledFontSize}, ${MAX_FONT_SIZE}))` : MAX_FONT_SIZE;
        return { fontSize, verticalAlign };
    }, [style, theme]);
    const classes = useMarkupStyles();
    const selected = selection === true;
    const editMode = useEditMode();
    const { native: nativeSelection } = useFlowCaretContext();
    const [block, setBlock] = useState(false);
    const className = clsx(
        classes.root,
        block && classes.block,
        selected && !nativeSelection && (editMode === "inactive" ? classes.selectedInactive : classes.selected),
        node instanceof StartMarkup && classes.startTag,
        node instanceof EndMarkup && classes.endTag,
        node instanceof EmptyMarkup && classes.emptyTag,
        (node instanceof StartMarkup || node instanceof EndMarkup) && !opposingTag && classes.broken,
    );
    const [rootElem, setRootElem] = useState<HTMLElement | null>(null);
    const rootElemRef = useRef<HTMLElement | null>(null);
    const ref = useCallback((dom: HTMLElement | null) => {
        outerRef(dom);
        setRootElem(dom);
        rootElemRef.current = dom;
    }, [outerRef]);
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
    const evalScope: ScriptEvalScope = { textStyle: style };
    const editingHost = useEditingHost();
    const controller = useFlowEditorController();
    const onChangeAttr = useCallback((key: string, value: string | Script | null): boolean => {
        try {
            if (!rootElemRef.current || !editingHost || !controller) {
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
    }, [editingHost, controller]);
    const onMakeBlock = useCallback(() => setBlock(true), [setBlock]);
    return (
        <span
            ref={ref}
            className={className}
            style={css}
            contentEditable={false}
            spellCheck={false}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            children={
                <MarkupTagContent
                    tag={tag}
                    attr={attr}
                    evalScope={evalScope}
                    onChangeAttr={onChangeAttr}
                    onMakeBlock={onMakeBlock}
                />
            }
        />
    );
};
