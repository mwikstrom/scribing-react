import React, { FC, ReactNode } from "react";
import { EmptyMarkup, EndMarkup, StartMarkup } from "scribing";
import { flowNode } from "./FlowNodeComponent";
import { useEditMode } from "./EditModeScope";
import { MarkupEditView, MarkupViewProps } from "./MarkupEditView";

export const StartMarkupView = flowNode<StartMarkup>((props, outerRef) => <MarkupView {...props} outerRef={outerRef}/>);
export const EmptyMarkupView = flowNode<EmptyMarkup>((props, outerRef) => <MarkupView {...props} outerRef={outerRef}/>);
export const EndMarkupView = flowNode<EndMarkup>((props, outerRef) => <MarkupView {...props} outerRef={outerRef}/>);

const REPLACEMENTS = new WeakMap<StartMarkup | EmptyMarkup | EndMarkup, ReactNode>();

export const setMarkupReplacement = (
    placeholder: EmptyMarkup,
    replacement: ReactNode
): void => void(REPLACEMENTS.set(placeholder, replacement));

const MarkupView: FC<MarkupViewProps> = props => {
    const { node } = props;
    const replacement = REPLACEMENTS.get(node) ?? null;
    const editMode = useEditMode();
    return editMode ? <MarkupEditView {...props} /> : replacement ? <>{replacement}</> : null;
};
