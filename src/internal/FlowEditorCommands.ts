import { FlowEditorState, FlowOperation, TargetOptions, TextStyle, TextStyleProps } from "scribing";

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

    isStrike(): boolean | undefined {
        return this.getTextStyle().get("strike");
    }

    toggleStrike(): void {
        this.toggleTextStyle("strike");
    }

    getBaselineOffset(): TextStyleProps["baseline"] {
        return this.getTextStyle().get("baseline");
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

    formatText<K extends keyof TextStyleProps>(key: K, value: TextStyleProps[K]): void {
        const { selection, caret } = this.#state;
        if (selection) {
            if (selection.isCollapsed) {
                this.#state = this.#apply(this.#state.set("caret", caret.set(key, value)));
            } else {
                const operation = selection.formatText(TextStyle.empty.set(key, value), this.getTargetOptions());
                this.#state = this.#apply(operation);
            }
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
