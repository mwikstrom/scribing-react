import { EmptyMarkup, StartMarkup } from "scribing";

/** @public */
export interface MarkupContext {
    readonly node: StartMarkup | EmptyMarkup;
    readonly parent: MarkupContext | null;
    readonly siblingsBefore: readonly (StartMarkup | EmptyMarkup)[];
}