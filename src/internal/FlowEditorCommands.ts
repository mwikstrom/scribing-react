import { 
    FlowEditorState, 
    FlowOperation, 
    ParagraphStyle, 
    ParagraphStyleProps, 
    ParagraphStyleVariant, 
    TargetOptions, 
    TextStyle, 
    TextStyleProps
} from "scribing";

/** @internal */
export class FlowEditorCommands {
    #state: FlowEditorState;
    readonly #apply: (change: FlowOperation | FlowEditorState | null) => FlowEditorState;

    constructor(state: FlowEditorState, apply: (change: FlowOperation | FlowEditorState | null) => FlowEditorState) {
        this.#state = state;
        this.#apply = apply;
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

    getLink(): TextStyleProps["link"] {
        return this.getTextStyle().get("link");
    }

    setLink(value: Exclude<TextStyleProps["link"], undefined>): void {
        this.formatText("link", value);
    }

    getTextColor(): TextStyleProps["color"] {
        return this.getTextStyle().get("color");
    }

    setTextColor(value: Exclude<TextStyleProps["color"], undefined>): void {
        this.formatText("color", value);
    }

    getTextAlignment(): ParagraphStyleProps["alignment"] {
        return this.getParagraphStyle().get("alignment");
    }

    setTextAlignment(value: Exclude<ParagraphStyleProps["alignment"], undefined>): void {
        this.formatParagraph("alignment", value);
    }

    getTextDirection(): ParagraphStyleProps["direction"] {
        return this.getParagraphStyle().get("direction");
    }

    setTextDirection(value: Exclude<ParagraphStyleProps["direction"], undefined>): void {
        this.formatParagraph("direction", value);
    }

    getParagraphVariant(): ParagraphStyleVariant | undefined {
        return this.getParagraphStyle().get("variant");
    }

    setParagraphVariant(value: ParagraphStyleVariant): void {
        this.formatParagraph("variant", value);
    }

    getLineSpacing(): ParagraphStyleProps["lineSpacing"] {
        return this.getParagraphStyle().get("lineSpacing");
    }

    setLineSpacing(value: Exclude<ParagraphStyleProps["lineSpacing"], undefined>): void {
        this.formatParagraph("lineSpacing", value);
    }    

    // TODO: spaceAbove
    // TODO: spaceBelow
    // TODO: listLevel
    // TODO: listMarker
    // TODO: hideListMarker
    // TODO: listCounter
    // TODO: listCounterPrefix
    // TODO: listCounterSuffix

    toggleTextStyle(key: BooleanTextStyleKeys): void {
        this.formatText(key, !this.getTextStyle().get(key));
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
}

type BooleanTextStyleKeys = {
    [K in keyof TextStyleProps]-?: boolean extends TextStyleProps[K] ? K : never
}[keyof TextStyleProps];
