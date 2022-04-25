import { DeferrableEvent } from "./DeferrableEvent";

/**
 * @public
 */
export type LinkAction = "open" | "push" | "replace" | LinkOpener;

/**
 * @public
 */
export interface LinkOpener {
    (link: LinkArgs): void;
}

/**
 * @public
 */
export interface LinkArgs {
    href: string;
    target: string;
    state: unknown;
}

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
    #action: LinkAction = "open";
    #state: unknown;
    
    constructor(href: string) {
        super();
        this.#href = href;
    }

    get action(): LinkAction { return this.#action; }
    set action(value: LinkAction) { this.#action = value; }

    get href(): string { return this.#href; }
    set href(value: string) { this.#href = value; }

    get state(): unknown { return this.#state; }
    set state(value: unknown) { this.#state = value; }

    get target(): string { 
        let result = this.#target;
        if (result === undefined) {
            result = ResolveLinkEvent.getDefaultTarget(this.#href);
        }
        return result;
    }

    set target(value: string) { this.#target = value; }
}
