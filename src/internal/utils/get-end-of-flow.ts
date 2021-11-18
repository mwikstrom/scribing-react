import { FlowContent, ParagraphBreak } from "scribing";

export const getEndOfFlow = (content: FlowContent): number => (
    content.size > 0 &&
    content.nodes.slice(-1)[0] instanceof ParagraphBreak
) ? content.size - 1 : content.size;
