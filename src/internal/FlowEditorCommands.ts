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

    isItalic(): boolean | undefined {
        return this.getTextStyle().get("italic");
    }

    isUnderlined(): boolean | undefined {
        return this.getTextStyle().get("underline");
    }

    toggleBold(): void {
        this.toggleTextStyle("bold");
    }

    toggleItalic(): void {
        this.toggleTextStyle("italic");
    }

    toggleUnderline(): void {
        this.toggleTextStyle("underline");
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
