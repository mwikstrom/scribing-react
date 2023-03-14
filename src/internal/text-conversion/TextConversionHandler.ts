import { FlowOperation, FlowSelection, FlowContent, FlowTheme, FlowRange } from "scribing";

export interface TextConversionHandler {
    isTrigger(insertedText: string): boolean;
    applyTo(context: TextConversionContext): (FlowOperation | FlowSelection | null | undefined)[] | undefined;
}

export interface TextConversionContext {
    readonly content: FlowContent;
    readonly position: number;
    readonly theme: FlowTheme | undefined;
    select(range: FlowRange): FlowSelection | null;
}