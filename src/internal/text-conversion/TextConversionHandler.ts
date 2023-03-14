import { FlowOperation, FlowSelection, FlowRange, TargetOptions } from "scribing";

export interface TextConversionHandler {
    isTrigger(insertedText: string): boolean;
    applyTo(context: TextConversionContext): (FlowOperation | FlowSelection | null | undefined)[] | undefined;
}

export interface TextConversionContext {
    readonly text: string;
    readonly position: number;
    readonly target: TargetOptions;
    select(range: FlowRange): FlowSelection | null;
}