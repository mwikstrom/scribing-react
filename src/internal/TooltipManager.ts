import { VirtualElement } from "@popperjs/core";
import { TooltipProps } from "./Tooltip";
import { PubSub } from "./utils/PubSub";

/** @internal */
export type TooltipData = Omit<TooltipProps, "active">;

/** @internal */
export class TooltipManager extends PubSub<TooltipData | null> {
    #active = new Map<number, TooltipData>();
    #currentKey: number | null = null;

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

    removeCurrent(): void {
        if (typeof this.#currentKey === "number") {
            this.remove(this.#currentKey);
        }
    }

    #notify(): void {
        const selected = this.#select();
        this.#setCurrent(selected);
    }

    #setCurrent(key: number | null): void {
        this.#currentKey = key;
        this.pub((key !== null && this.#active.get(key)) || null);
    }

    #select(): number | null {
        const array = Array.from(this.#active).reverse();

        if (array.length === 0) {
            return null;
        }

        return array[0][0];
    }
}

const areOverlappingRects = (first: DOMRect, second: DOMRect): boolean => !(
    first.right < second.left || 
    first.left > second.right || 
    first.bottom < second.top || 
    first.top > second.bottom
);

const areEqualTooltips = (first: TooltipData, second: TooltipData | undefined): boolean => {
    if (second === void(0)) {
        return false;
    }

    if (first === second) {
        return true;
    }

    return (
        areEqualVirtualElements(first.reference, second.reference) &&
        first.content === second.content
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
