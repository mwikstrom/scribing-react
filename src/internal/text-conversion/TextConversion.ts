import { FlowContent, FlowOperation, FlowRange, FlowSelection, FlowTheme } from "scribing";

export interface TextConversion {
    isTrigger(event: KeyboardEvent): boolean;
    applyTo(context: TextConversionContext): [FlowOperation | null, FlowSelection | null] | undefined;
}

export interface TextConversionContext {
    readonly content: FlowContent;
    readonly position: number;
    readonly theme: FlowTheme | undefined;
    select(range: FlowRange): FlowSelection | null;
}