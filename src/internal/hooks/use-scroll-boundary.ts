import { useMemo } from "react";

export function useScrollBoundary(element: HTMLElement | null): Element | Document | null {
    return useMemo<Element | Document | null> (() => {
        if (!element) {
            return null;
        }

        for (let parent = element.parentElement; parent; parent = parent?.parentElement) {
            if (isScrollBoundary(parent)) {
                return parent;
            }
        }

        return document;
    }, [element]);
}

const isScrollBoundary = (element: Element): boolean => {
    const { overflowX, overflowY } = getComputedStyle(element);
    return [overflowX, overflowY].some(prop => SCROLL_PROPS.includes(prop));
};

const SCROLL_PROPS = ["auto", "scroll"];
