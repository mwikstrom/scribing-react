/**
 * @public
 */
export abstract class DeferrableEvent {
    readonly #deferringCallbacks = new Set<() => Promise<void>>();

    defer(callback: () => Promise<void>): void {
        this.#deferringCallbacks.add(callback);
    }

    /** @internal */
    async _complete(): Promise<this> {
        await Promise.all(Array.from(this.#deferringCallbacks).map(callback => callback()));
        return this;
    }
}