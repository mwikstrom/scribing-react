/**
 * @public
 */
export class DeferrableEvent {
    readonly #deferringCallbacks = new Set<() => Promise<void>>();
    #pending = false;

    defer(callback: () => Promise<void>): void {
        this.#deferringCallbacks.add(callback);
        this.#pending = true;
    }

    public get pending(): boolean { return this.#pending; }

    /** @internal */
    async _complete(): Promise<void> {
        await Promise.all(Array.from(this.#deferringCallbacks).map(callback => callback()));
        this.#pending = false;
    }
}
