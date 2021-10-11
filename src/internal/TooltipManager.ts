import { VirtualElement } from "@popperjs/core";
import { TooltipProps } from "./Tooltip";
import { PubSub } from "./utils/PubSub";

/** @internal */
export class TooltipManager extends PubSub<TooltipProps | null> {
    #active = new Map<number, TooltipProps>();

    addOrUpdate(key: number, reference: VirtualElement, message: string): void {
        const existing = this.#active.get(key);
        if (!existing || (existing.reference !== reference || existing.message !== message)) {
            this.#active.set(key, Object.freeze({ reference, message }));
            this.#notify();
        }
    }

    remove(key: number): void {
        if (this.#active.delete(key)) {
            this.#notify();
        }
    }

    #notify(): void {
        let last: TooltipProps | null = null;
        for (const value of this.#active.values()) {
            last = value;
        }
        this.pub(last);
    }
}
