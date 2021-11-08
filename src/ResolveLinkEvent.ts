import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export class ResolveLinkEvent extends DeferrableEvent {
    #href: string;
    #target: string;
    
    constructor(href: string, target: string) {
        super();
        this.#href = href;
        this.#target = target;
    }

    get href(): string { return this.#href; }
    set href(value: string) { this.#href = value; }

    get target(): string { return this.#target; }
    set target(value: string) { this.#target = value; }
}
