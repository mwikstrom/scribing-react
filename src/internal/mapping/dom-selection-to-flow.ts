import { FlowRange, FlowSelection, FlowRangeSelection } from "scribing";
import { FlowPath, mapDomPositionToFlow } from "./dom-position-to-flow";
import { NestedFlowPosition } from "./flow-axis";

/** @internal */
export function mapDomSelectionToFlow(
    domSelection: Selection | null,
    editingHost: HTMLElement,
): FlowSelection | null {
    if (domSelection === null) {
        return null;
    }

    const { anchorNode, anchorOffset, isCollapsed } = domSelection;
    const anchorPath = mapDomPositionToFlow(anchorNode, anchorOffset, editingHost);
    if (anchorPath === null) {
        return null;
    }

    if (isCollapsed) {
        return createFlowSelection(anchorPath);
    }

    const { focusNode, focusOffset } = domSelection;
    const focusPath = mapDomPositionToFlow(focusNode, focusOffset, editingHost);
    if (focusPath === null) {
        return null;
    }

    const {
        commonAnchorPath,
        leafFocusDistance,
    } = getCommonFlowPath(anchorPath, focusPath);

    return createFlowSelection(commonAnchorPath, leafFocusDistance);
}

/** @internal */
export const createFlowSelection = (
    commonAnchorPath: FlowPath,
    leafFocusDistance = 0,    
): FlowSelection => {
    const [ rootPosition, ...nestedPath ] = commonAnchorPath;
    return createNestedSelection(rootPosition, leafFocusDistance, nestedPath);
};

const createNestedSelection = (
    outerPosition: number,
    leafFocusDistance: number,
    anchorPath: readonly NestedFlowPosition[],
): FlowSelection => {
    if (anchorPath.length === 0) {
        return new FlowRangeSelection({ range: FlowRange.at(outerPosition, leafFocusDistance) });
    } else {
        const [nested, ...rest] = anchorPath;
        const { innerPosition, outerAxis } = nested;
        const innerSelection = createNestedSelection(innerPosition, leafFocusDistance, rest);
        return outerAxis.createNestedSelection(outerPosition, innerSelection);
    }
};

/** @internal */
export interface CommonPath {
    commonAnchorPath: FlowPath;
    leafFocusDistance: number;
}

/** @internal */
export const getCommonFlowPath = (
    anchorPath: FlowPath,
    focusPath: FlowPath,
): CommonPath => {
    const [anchorRoot, ...nestedAnchorPath] = anchorPath;
    const [focusRoot, ...nestedFocusPath] = focusPath;
    const minNestedDepth = Math.min(nestedAnchorPath.length, nestedFocusPath.length);
    const commonNestedPath: NestedFlowPosition[] = [];
    let leafFocusDistance = focusRoot - anchorRoot;

    for (let i = 0; i < minNestedDepth && leafFocusDistance === 0; ++i) {
        const { outerAxis: anchorAxis, innerPosition: anchorPosition } = nestedAnchorPath[i];
        const { outerAxis: focusAxis, innerPosition: focusPosition } = nestedFocusPath[i];

        if (!anchorAxis.equals(focusAxis)) {
            break;
        }

        leafFocusDistance = focusPosition - anchorPosition;
        commonNestedPath.push({
            innerPosition: anchorPosition,
            outerAxis: anchorAxis,
        });
    }

    if (nestedFocusPath.length > commonNestedPath.length) {
        if (leafFocusDistance < 0) {
            --leafFocusDistance;
        } else {
            ++leafFocusDistance;
        }
    }

    let anchorRootDelta = 0;
    if (nestedAnchorPath.length > commonNestedPath.length) {
        if (commonNestedPath.length === 0) {
            anchorRootDelta = leafFocusDistance < 0 ? 1 : 0;
        } else {
            const lastNested = commonNestedPath[commonNestedPath.length - 1];
            if (leafFocusDistance < 0) {
                ++lastNested.innerPosition;
            } else {
                --lastNested.innerPosition;
            }
        }
    }

    const commonAnchorPath: FlowPath = [ anchorRoot + anchorRootDelta, ...commonNestedPath ];
    return { commonAnchorPath, leafFocusDistance };
};
