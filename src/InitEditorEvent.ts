import { FlowContent } from "scribing";
import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export class InitEditorEvent extends DeferrableEvent {
    public language?: string;
    public content?: FlowContent;
    public skip = false;
}

