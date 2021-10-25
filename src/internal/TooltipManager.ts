import { VirtualElement } from "@popperjs/core";
import { TooltipProps } from "./Tooltip";
import { PubSub } from "./utils/PubSub";

/** @internal */
export type TooltipData = Omit<TooltipProps, "active" | "boundary" | "editingHost">;

/** @internal */
export class TooltipManager extends PubSub<TooltipData | null> {
    #map = new Map<number, TooltipData>();

    public readonly editingHost = new PubSub<HTMLElement | null>(null);

    addOrUpdate(props: TooltipData): void {
        const { key } = props;
        const existing = this.#map.get(key);
        if (!areEqualTooltips(props, existing)) {
            this.#map.set(key, props);
            this.#notify();
        }
    }

    remove(key: number): void {
        if (this.#map.delete(key)) {
            this.#notify();
        }
    }

    #notify(): void {
        const active = this.#select();
        this.pub(active);
    }

    #select(): TooltipData | null {
        const array = Array.from(this.#map.values()).reverse();

        if (array.length === 0) {
            return null;
        }

        return array[0];
    }
}

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
