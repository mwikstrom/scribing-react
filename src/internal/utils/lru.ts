export class LRU<Key, Value> {
    readonly #map = new Map<Key, Value>();
    #max = 0;
    #last: Key | undefined;

    constructor(max: number) {
        this.max = max;
    }

    get max(): number { return this.#max; }

    set max(value: number) {
        const isLess = value < this.#max;
        this.#max = value;
        if (isLess) {
            this.#trim();
        }
    }
    
    get(key: Key): Value | undefined {
        const value = this.#map.get(key);
        if (value !== void(0) && this.#last !== key) {
            this.#map.delete(key);
            this.#map.set(key, value);
            this.#last = key;
        }
        return value;
    }

    set(key: Key, value: Value): void {        
        const isNew = this.#last !== key && !this.#map.delete(key);
        this.#map.set(key, value);
        this.#last = key;
        if (!isNew) {
            this.#trim();
        }
    }

    #trim(): void {
        let excess = this.#map.size - this.#max;
        if (excess > 0) {
            const slated = new Set<Key>();
            for (const key of this.#map.keys()) {
                if (excess > 0) {
                    slated.add(key);
                    --excess;
                } else {
                    break;
                }            
            }
            for (const key of slated) {
                this.#map.delete(key);
            }
        }
    }
}