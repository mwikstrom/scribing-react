export function isSelectionInside(rootElement: HTMLElement, selection: Selection | null): boolean {
    if (selection === null) {
        return false;
    }

    const { anchorNode, focusNode } = selection;
    if (anchorNode === null || focusNode === null) {
        return false;
    }

    if (!rootElement.contains(anchorNode)) {
        return false;
    }

    if (focusNode === anchorNode) {
        return true;
    }

    return rootElement.contains(focusNode);
}