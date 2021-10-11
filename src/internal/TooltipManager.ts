import { VirtualElement } from "@popperjs/core";
import { TooltipMessageProps, TooltipProps } from "./Tooltip";
import { PubSub } from "./utils/PubSub";

/** @internal */
export type TooltipData = Omit<TooltipProps, "active">;

/** @internal */
export class TooltipManager extends PubSub<TooltipData | null> {
    #active = new Map<number, TooltipData>();

    addOrUpdate(key: number, props: TooltipData): void {
        const existing = this.#active.get(key);
        if (!areEqualTooltips(props, existing)) {
            this.#active.set(key, props);
            this.#notify();
        }
    }

    remove(key: number): void {
        if (this.#active.delete(key)) {
            this.#notify();
        }
    }

    #notify(): void {
        const array = Array.from(this.#active.values()).reverse();

        if (array.length === 0) {
            this.pub(null);
            return;
        }

        const first = array[0];
        let count = 1;
        let mergedRect: DOMRect | undefined;
        while (count < array.length) {
            if (!mergedRect) {
                mergedRect = first.reference.getBoundingClientRect();
            }

            const nextRect = array[count].reference.getBoundingClientRect();
            if (!areOverlappingRects(mergedRect, nextRect)) {
                break;
            }

            mergedRect = mergeRects(mergedRect, nextRect);
            ++count;
        }

        if (count === 1) {
            this.pub(first);
            return;
        }

        this.pub(createMergedTooltip(array.slice(0, count)));
    }
}

const areOverlappingRects = (first: DOMRect, second: DOMRect): boolean => !(
    first.right < second.left || 
    first.left > second.right || 
    first.bottom < second.top || 
    first.top > second.bottom
);

const mergeRects = (first: DOMRect, second: DOMRect): DOMRect => new DOMRect(
    Math.min(first.x, second.x),
    Math.min(first.y, second.y),
    Math.max(first.width, second.width),
    Math.max(first.height, second.height)
);

const createMergedTooltip = (array: readonly TooltipData[]): TooltipData => ({
    reference: {
        getBoundingClientRect() {
            const rects = array.map(item => item.reference.getBoundingClientRect());
            return rects.slice(1).reduce((prev, next) => mergeRects(prev, next), rects[0]);
        },
    },
    messages: array.flatMap(item => item.messages || []),
    editor: array.filter(item => !!item.editor).map(item => item.editor)[0] || null,
});

const areEqualTooltips = (first: TooltipData, second: TooltipData | undefined): boolean => {
    if (second === void(0)) {
        return false;
    }

    if (first === second) {
        return true;
    }

    return (
        areEqualVirtualElements(first.reference, second.reference) &&
        areEqualArrays(first.messages || [], second.messages || [], areEqualTooltipMessages) &&
        first.editor === second.editor
    );
};

const areEqualVirtualElements = (first: VirtualElement, second: VirtualElement): boolean => {
    if (first === second) {
        return true;
    }

    if (first.contextElement !== void(0)) {
        return first.contextElement === second.contextElement;
    }

    return false;
};

const areEqualArrays = <T>(
    first: readonly T[],
    second: readonly T[],
    areEqualElements: (first: T, second: T) => boolean
): boolean => {
    if (first === second) {
        return true;
    }

    if (first.length !== second.length) {
        return false;
    }

    return first.every((item, index) => areEqualElements(item, second[index]));
};

const areEqualTooltipMessages = (first: TooltipMessageProps, second: TooltipMessageProps): boolean => {
    if (first === second) {
        return true;
    }

    if (first.key !== second.key) {
        return false;
    }

    return first.text === second.text;
};
