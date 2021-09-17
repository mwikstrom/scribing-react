import { FlowSelection } from "scribing";
import { mapDomRangeToFlow } from "../mapping/dom-range-to-flow";

/** @internal */
export const getSelectionFromInput = (event: InputEvent, editingHost: HTMLElement): FlowSelection | null => {
    const dom = event.getTargetRanges();

    if (dom.length !== 1) {
        // TODO: Support multiple ranges (but I don't see when browser will ever do that)
        return null;
    }

    const backward = event.inputType === "deleteContentBackward";
    return mapDomRangeToFlow(dom[0], editingHost, backward);
};
