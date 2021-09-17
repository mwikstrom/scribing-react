import { FlowSelection, RangeSelection, TextRun } from "scribing";
import { isMappedEditingHost } from "./flow-editing-host";
import { getFlowSizeFromDomNode, getMappedFlowNode } from "./flow-node";

/** @internal */
export function mapFlowSelectionToDom(
    flowSelection: FlowSelection | null,
    editingHost: HTMLElement,
    domSelection: Selection,
): void {
    if (flowSelection instanceof RangeSelection) {
        const { range } = flowSelection;
        const [ anchorNode, anchorOffset ] = mapFlowPositionToDom(range.anchor, editingHost);
        const [ focusNode, focusOffset ] = range.isCollapsed ?
            [ anchorNode, anchorOffset ] :
            mapFlowPositionToDom(range.focus, editingHost);
        if (focusNode && anchorNode) {
            domSelection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
            return;
        }
    }
    domSelection.removeAllRanges();
}

type DomPosition = [Node | null, number];

const mapFlowPositionToDom = (
    position: number,
    container: Node,
): DomPosition => {
    const { childNodes } = container;
    for (let i = 0; i < childNodes.length; ++i) {
        const node = childNodes.item(i);
        const size = getFlowSizeFromDomNode(node);
        if (position > size) {
            position -= size;
        } else {
            const mapped = mapFlowPositionToDomCore(position, node);
            if (!mapped && position === size && (i + 1) < childNodes.length) {
                return [container, i + 1];
            } else {
                return mapped;
            }
        }
    }
    return UNMAPPED;
};

const mapFlowPositionToDomCore = (
    position: number,
    node: Node,
): DomPosition => {
    if (position < 0) {
        return UNMAPPED;
    }

    if (isMappedEditingHost(node)) {
        return UNMAPPED;
    }

    if (getMappedFlowNode(node) instanceof TextRun) {
        const { childNodes } = node;
        let result: DomPosition = [node, 0];
        for (let i = 0; i < childNodes.length; ++i) {
            const child = childNodes.item(i);
            if (child.nodeType === Node.TEXT_NODE) {
                const size = node.textContent?.length || 0;
                result = [child, Math.min(size, position)];
                if (position <= size) {
                    break;
                } else {
                    position -= size;
                }
            }
        }
        return result;
    }

    return mapFlowPositionToDom(position, node);
};

const UNMAPPED: DomPosition = [null, 0];