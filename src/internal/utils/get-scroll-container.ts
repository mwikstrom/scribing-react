/** @internal */
export function getScrollContainer(element: HTMLElement): HTMLElement | Window {
    while (!isScrollContainer(element)) {
        const { parentElement } = element;
        if (parentElement) {
            element = parentElement;
        } else {
            return window;
        }
    }
    return element;
}

function isScrollContainer(element: HTMLElement): boolean {
    const { style: { overflow, overflowX, overflowY } } = element;
    return !!overflow || !!overflowX || !!overflowY;
}
