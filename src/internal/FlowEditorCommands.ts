import { 
    BoxStyle,
    BoxStyleProps,
    DynamicText,
    FlowColor,
    FlowContent,
    FlowEditorState, 
    FlowNode, 
    FlowOperation, 
    FlowRange, 
    Interaction, 
    OrderedListMarkerKindType, 
    ParagraphStyle, 
    ParagraphStyleProps, 
    ParagraphVariant, 
    TargetOptions, 
    TextRun, 
    TextStyle, 
    TextStyleProps,
    UnorderedListMarkerKindType
} from "scribing";

/** @internal */
export class FlowEditorCommands {
    #state: FlowEditorState;
    readonly #apply: (change: FlowOperation | FlowEditorState | null) => FlowEditorState;

    constructor(state: FlowEditorState, apply: (change: FlowOperation | FlowEditorState | null) => FlowEditorState) {
        this.#state = state;
        this.#apply = apply;
    }

    isCaret(): boolean {
        const { selection } = this.#state;
        return selection !== null && selection.isCollapsed;
    }

    isBold(): boolean | undefined {
        return this.getTextStyle().get("bold");
    }

    toggleBold(): void {
        this.toggleTextStyle("bold");
    }

    isItalic(): boolean | undefined {
        return this.getTextStyle().get("italic");
    }

    toggleItalic(): void {
        this.toggleTextStyle("italic");
    }

    isUnderlined(): boolean | undefined {
        return this.getTextStyle().get("underline");
    }

    toggleUnderline(): void {
        this.toggleTextStyle("underline");
    }

    isStricken(): boolean | undefined {
        return this.getTextStyle().get("strike");
    }

    toggleStrike(): void {
        this.toggleTextStyle("strike");
    }

    getBaselineOffset(): TextStyleProps["baseline"] {
        return this.getTextStyle().get("baseline");
    }

    isSubscript(): boolean | undefined {
        const offset = this.getBaselineOffset();
        if (offset === "sub") {
            return true;
        } else if (offset !== void(0)) {
            return false;
        }
    }

    isSuperscript(): boolean | undefined {
        const offset = this.getBaselineOffset();
        if (offset === "super") {
            return true;
        } else if (offset !== void(0)) {
            return false;
        }
    }

    toggleSubscript(): void {
        if (this.isSubscript()) {
            this.setBaselineOffset("normal");
        } else {
            this.setBaselineOffset("sub");
        }
    }

    toggleSuperscript(): void {
        if (this.isSuperscript()) {
            this.setBaselineOffset("normal");
        } else {
            this.setBaselineOffset("super");
        }
    }

    setBaselineOffset(value: Exclude<TextStyleProps["baseline"], undefined>): void {
        this.formatText("baseline", value);
    }

    getFontFamily(): TextStyleProps["fontFamily"] {
        return this.getTextStyle().get("fontFamily");
    }
    
    setFontFamily(value: Exclude<TextStyleProps["fontFamily"], undefined>): void {
        this.formatText("fontFamily", value);
    }

    getFontSize(): TextStyleProps["fontSize"] {
        return this.getTextStyle().get("fontSize");
    }

    setFontSize(value: Exclude<TextStyleProps["fontSize"], undefined>): void {
        this.formatText("fontSize", value);
    }

    getInteraction(): Interaction | null | undefined {
        const buttonAction = this.getBoxInteraction();
        if (buttonAction === void(0)) {
            return this.getLink();
        } else {
            return buttonAction;
        }
    }

    setInteraction(value: Interaction | null): void {
        if (this.isBox()) {
            this.setBoxInteraction(value);
        } else {
            this.setLink(value);
        }
    }

    getLink(): TextStyleProps["link"] {
        return this.getTextStyle().get("link");
    }

    setLink(value: Exclude<TextStyleProps["link"], undefined>): void {
        if (this.isCaret() && this.isLink()) {
            this.expandCaretToTextRun();
        }
        this.formatText("link", value);
    }

    getColor(): TextStyleProps["color"] {
        if (this.isBox()) {
            return this.getBoxColor();
        } else {
            return this.getTextColor();
        }
    }

    setColor(value: FlowColor): void {
        if (this.isBox()) {
            this.setBoxColor(value);
        } else {
            this.setTextColor(value);
        }
    }

    getTextColor(): FlowColor | undefined {
        return this.getTextStyle().get("color");
    }

    setTextColor(value: FlowColor): void {
        this.formatText("color", value);
    }

    getBoxColor(): FlowColor | undefined {
        return this.getBoxStyle().get("color");
    }

    setBoxColor(value: FlowColor): void {
        this.formatBox("color", value);
    }

    getTextAlignment(): ParagraphStyleProps["alignment"] {
        return this.getParagraphStyle().get("alignment");
    }

    isTextAlignment(value: ParagraphStyleProps["alignment"]): boolean | undefined {
        const actual = this.getTextAlignment();
        if (actual === value) {
            return true;
        } else if (actual !== void(0)) {
            return false;
        }
    }

    setTextAlignment(value: Exclude<ParagraphStyleProps["alignment"], undefined>): void {
        this.formatParagraph("alignment", value);
    }

    getTextDirection(): ParagraphStyleProps["direction"] {
        return this.getParagraphStyle().get("direction");
    }

    isTextDirection(value: ParagraphStyleProps["direction"]): boolean | undefined {
        const actual = this.getTextDirection();
        if (actual === value) {
            return true;
        } else if (actual !== void(0)) {
            return false;
        }
    }

    setTextDirection(value: Exclude<ParagraphStyleProps["direction"], undefined>): void {
        this.formatParagraph("direction", value);
    }

    getParagraphVariant(): ParagraphVariant | undefined {
        return this.getParagraphStyle().get("variant");
    }

    setParagraphVariant(value: ParagraphVariant): void {
        this.formatParagraph("variant", value);
    }

    getLineSpacing(): ParagraphStyleProps["lineSpacing"] {
        return this.getParagraphStyle().get("lineSpacing");
    }

    setLineSpacing(value: Exclude<ParagraphStyleProps["lineSpacing"], undefined>): void {
        this.formatParagraph("lineSpacing", value);
    }    

    getListLevel(): number | undefined {
        return this.getParagraphStyle().get("listLevel");
    }

    incrementListLevel(): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.incrementListLevel(content));
        }
    }

    decrementListLevel(): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.decrementListLevel(content));
        }
    }

    isUnorderedList(): boolean | undefined {
        const { listMarker, hideListMarker, listLevel } = this.getParagraphStyle();
        if (listMarker && hideListMarker !== void(0) && listLevel !== void(0)) {
            if (hideListMarker || listLevel <= 0) {
                return false;
            }

            return UnorderedListMarkerKindType.test(listMarker);
        }
    }

    isOrderedList(): boolean | undefined {
        const { listMarker, hideListMarker, listLevel } = this.getParagraphStyle();
        if (listMarker && hideListMarker !== void(0) && listLevel !== void(0)) {
            if (hideListMarker || listLevel <= 0) {
                return false;
            }

            return OrderedListMarkerKindType.test(listMarker);
        }
    }

    toggleUnorderedList(): void {
        const apply = this.isUnorderedList() ? null : "unordered";
        this.formatList(apply);
    }

    toggleOrderedList(): void {
        const apply = this.isOrderedList() ? null : "ordered";
        this.formatList(apply);
    }

    formatList(kind: "ordered" | "unordered" | null): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.formatList(content, kind));
        }
    }

    // TODO: spaceAbove
    // TODO: spaceBelow
    // TODO: listCounter
    // TODO: listCounterPrefix
    // TODO: listCounterSuffix

    toggleTextStyle(key: BooleanTextStyleKeys): void {
        this.formatText(key, !this.getTextStyle().get(key));
    }

    getBoxStyle(): BoxStyle {
        // TODO: Implement getBoxStyle
        //const { selection, content, theme } = this.#state;
        //return selection === null ? BoxStyle.empty : selection.getUniformBoxStyle(content, theme);
        return BoxStyle.empty;
    }

    getTextStyle(): TextStyle {
        const { selection, content, theme, caret } = this.#state;
        const uniform = selection === null ? TextStyle.empty : selection.getUniformTextStyle(content, theme);
        if (selection?.isCollapsed) {
            return uniform.merge(caret);
        } else {
            return uniform;
        }
    }

    getParagraphStyle(): ParagraphStyle {
        const { selection, content, theme } = this.#state;
        return selection === null ? ParagraphStyle.empty : selection.getUniformParagraphStyle(content, theme);
    }

    formatBox<K extends keyof BoxStyleProps>(key: K, value: BoxStyleProps[K]): void {
        const { selection } = this.#state;
        if (selection) {
            const style = BoxStyle.empty.set(key, value);
            const options = this.getTargetOptions();
            const operation = selection.formatBox(style, options);
            this.#state = this.#apply(operation);
        }
    }

    formatText<K extends keyof TextStyleProps>(key: K, value: TextStyleProps[K]): void {
        const { selection, caret } = this.#state;
        if (selection) {
            if (selection.isCollapsed) {
                this.#state = this.#apply(this.#state.set("caret", caret.set(key, value)));
            } else {
                const style = TextStyle.empty.set(key, value);
                const options = this.getTargetOptions();
                const operation = selection.formatText(style, options);
                this.#state = this.#apply(operation);
            }
        }
    }

    formatParagraph<K extends keyof ParagraphStyleProps>(key: K, value: ParagraphStyleProps[K]): void {
        const { selection } = this.#state;
        if (selection) {
            const style = ParagraphStyle.empty.set(key, value);
            const options = this.getTargetOptions();
            const operation = selection.formatParagraph(style, options);
            this.#state = this.#apply(operation);
        }
    }

    getTargetOptions(): TargetOptions {
        const { content: target, theme } = this.#state;
        return { target, theme };
    }

    getCaretStyle(): TextStyle {
        return this.#state.caret;
    }

    insertText(text: string): void {
        const node = new TextRun({ text, style: TextStyle.empty });
        this.insertNode(node);
    }

    insertNode(node: FlowNode): void {
        const content = new FlowContent({ nodes: Object.freeze([node])});
        this.insertContent(content);
    }

    insertContent(content: FlowContent): void {
        const { selection } = this.#state;
        if (selection) {
            this.#apply(selection.insert(content));
        }
    }

    isBox(): boolean {
        // TODO: Implement
        return false;
    }

    getBoxInteraction(): Interaction | null | undefined {
        // TODO: Implement
        return undefined;
    }

    setBoxInteraction(value: Interaction | null): void {
        // TODO: Implement
        console.log("TODO: Set box interaction", value);
    }

    isLink(): boolean {
        const { selection } = this.#state;
        
        if (selection === null) {
            return false;
        }

        let foundLink = false;
        let foundOther = false;

        selection.transformRanges((range, options = {}) => {
            const { target } = options;

            if (target) {
                for (const node of target.peek(range.first).range(range.size)) {
                    if (node instanceof TextRun && !!node.style.link) {
                        foundLink = true;
                    } else {
                        foundOther = true;
                    }
                }
            }

            return null;
        }, this.getTargetOptions());

        return foundLink && !foundOther;
    }

    getDynamicExpression(): string | null | undefined {
        // TODO: Add support for conditional expressions too
        return this.getDynamicTextExpression();
    }

    setDynamicExpression(value: string): void {
        // TODO: Implement set dynamic expression
        console.warn("Not implemented. Cannot set dynamic expression:", value);
    }

    getDynamicTextExpression(): string | null | undefined {
        const { selection } = this.#state;
        
        if (selection === null) {
            return null;
        }

        let result: string | null | undefined = null;

        selection.transformRanges((range, options = {}) => {
            const { target } = options;

            if (target) {
                for (const node of target.peek(range.first).range(range.size)) {
                    if (node instanceof DynamicText) {
                        if (result === null || result === node.expression) {
                            result = node.expression;
                        } else {
                            result = void(0);
                        }
                    } else {
                        result = void(0);
                    }
                }
            }

            return null;
        }, this.getTargetOptions());

        return result;
    }

    expandCaretToTextRun(): void {
        const { selection } = this.#state;
        
        if (selection === null) {
            return;
        }

        const newSelection = selection.transformRanges((range, options = {}) => {
            const { target } = options;
            
            if (!target || !range.isCollapsed) {
                return null;
            }

            const { node, offset } = target.peek(range.first);

            if (!(node instanceof TextRun)) {
                return null;
            }

            return FlowRange.at(range.first - offset, node.size);
        }, this.getTargetOptions());

        this.#state = this.#apply(this.#state.set("selection", newSelection));
    }

    getFormattingMarks(): boolean {
        return this.#state.formattingMarks;
    }

    toggleFormattingMarks(): void {
        this.#state = this.#apply(this.#state.set("formattingMarks", !this.#state.formattingMarks));
    }
}

type BooleanTextStyleKeys = {
    [K in keyof TextStyleProps]-?: boolean extends TextStyleProps[K] ? K : never
}[keyof TextStyleProps];
