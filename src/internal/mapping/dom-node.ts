/** @internal */
export const registerTemplateNode = (node: Node | null): void => {
    if (node) {
        TEMPLATES.add(node);
    }
};

/** @internal */
export const isMappedTemplateNode = (node: Node | null): boolean => !!node && TEMPLATES.has(node);

const TEMPLATES = new WeakSet<Node>();
