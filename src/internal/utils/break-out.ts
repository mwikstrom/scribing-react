export function registerBreakOutNode(node: HTMLElement | null): void {
    if (node) {
        BreakOutNodes.add(node);
    }
}

export function isBreakOutNode(node: Node | null): boolean {
    return !!node && BreakOutNodes.has(node);
}

export function isInsideBreakOut(root: HTMLElement | null, node: Node | EventTarget | null): boolean {
    if (!node || node === root || !(node instanceof Node)) {
        return false;
    }

    if (BreakOutNodes.has(node)) {
        return true;
    }

    return isInsideBreakOut(root, node.parentElement);
}

const BreakOutNodes = new WeakSet<Node>();
