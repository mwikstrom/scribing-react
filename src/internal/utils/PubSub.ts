/** @public */
export class PubSub<T> {
    #listeners = new Map<(value: T) => void, number>();
    #current: T | undefined;

    public constructor(initial?: T) {
        this.#current = initial;
    }

    public get current(): T | undefined {
        return this.#current;
    }

    public pub(value: T): void {
        this.#current = value;
        for (const callback of this.#listeners.keys()) {
            try {
                callback(value);
            } catch (err) {
                console.error(`${this.constructor.name}: listener threw exception:`, err);
            }
        }
    }

    public sub(callback: (value: T) => void): () => void {
        const incrementedCount = (this.#listeners.get(callback) ?? 0) + 1;
        let active = true;
        if (this.#listeners.set(callback, incrementedCount).size === 1) {
            this.onStart();
        }
        return () => {
            if (active) {
                active = false;
                const decrementedCount = (this.#listeners.get(callback) ?? 0) - 1;
                if (decrementedCount > 0) {
                    this.#listeners.set(callback, decrementedCount);
                } else if (this.#listeners.delete(callback) && this.#listeners.size === 0) {
                    this.onStop();
                }
            }
        };
    }

    /** @virtual */
    protected onStart(): void { /* no-op */ }

    /** @virtual */
    protected onStop(): void { /* no-op */ }
}
