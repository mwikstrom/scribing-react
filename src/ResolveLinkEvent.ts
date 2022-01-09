import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export class ResolveLinkEvent extends DeferrableEvent {
    static getDefaultTarget(href: string): string {
        if (/^\//.test(href)) {
            return "_self";
        } else {
            return "_blank";
        }
    }

    #href: string;
    #target: string | undefined;
    
    constructor(href: string) {
        super();
        this.#href = href;
    }

    get href(): string { return this.#href; }
    set href(value: string) { this.#href = value; }

    get target(): string { 
        let result = this.#target;
        if (result === undefined) {
            result = ResolveLinkEvent.getDefaultTarget(this.#href);
        }
        return result;
    }

    set target(value: string) { this.#target = value; }
}
