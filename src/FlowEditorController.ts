import { nanoid } from "nanoid";
import { 
    BoxStyle,
    BoxStyleProps,
    CellPosition,
    CellRange,
    CompleteUpload,
    DynamicText,
    EndMarkup,
    FlowBatch,
    FlowBox,
    FlowBoxSelection,
    FlowColor,
    FlowContent,
    FlowIcon, 
    FlowImage, 
    FlowNode, 
    FlowOperation, 
    FlowRange, 
    FlowRangeSelection, 
    FlowSelection, 
    FlowTable, 
    FlowTableCell, 
    FlowTableCellSelection, 
    FlowTableContent, 
    ImageSource, 
    Interaction, 
    OrderedListMarkerKindType, 
    ParagraphBreak, 
    ParagraphStyle, 
    ParagraphStyleProps, 
    ParagraphVariant, 
    RemoveFlowSelectionOptions, 
    StartMarkup, 
    TableStyle, 
    TargetOptions, 
    TextRun, 
    TextStyle, 
    TextStyleProps,
    UnorderedListMarkerKindType
} from "scribing";
import { FlowEditorProps } from "./FlowEditor";
import { FlowEditorState } from "./FlowEditorState";
import { StoreAssetEvent } from "./StoreAssetEvent";
import { getEndOfFlow } from "./internal/utils/get-end-of-flow";
import { PubSub } from "./internal/utils/PubSub";

/** @public */
export class FlowEditorController {
    #state!: FlowEditorState;
    #apply!: (change: FlowOperation | FlowEditorState | null) => FlowEditorState;
    #onStoreAsset: FlowEditorProps["onStoreAsset"];
    readonly #uploads = new Map<string, Blob>();
    #fresh: PubSub<FlowEditorController> | undefined;

    constructor(
        state: FlowEditorState,
        apply: (change: FlowOperation | FlowEditorState | null, before: FlowEditorState) => FlowEditorState,
        onStoreAsset: FlowEditorProps["onStoreAsset"],
        uploads = new Map<string, Blob>(),
    ) {
        this._sync(state, apply, onStoreAsset);
        this.#uploads = uploads;
    }

    /** @internal */
    _sync(
        state: FlowEditorState,
        apply: (change: FlowOperation | FlowEditorState | null, before: FlowEditorState) => FlowEditorState,
        onStoreAsset: FlowEditorProps["onStoreAsset"],
    ): void {
        this.#state = state;
        this.#apply = change => apply(change, this.#state);
        this.#onStoreAsset = onStoreAsset;
        if (this.#fresh) {
            this.#fresh.pub(new FlowEditorController(state, apply, onStoreAsset, this.#uploads));
        }
    }

    /** @internal */
    _observe(
        callback: (fresh: FlowEditorController) => void,
    ): () => void {
        if (!this.#fresh) {
            this.#fresh = new PubSub<FlowEditorController>(this);
        }
        return this.#fresh.sub(callback);
    }

    isTableSelection(): boolean {
        const { selection } = this.#state;
        let result: boolean | undefined;
        selection?.visitRanges(range => result = result !== false && range instanceof CellRange);
        return !!result;
    }

    isAtStartOfTableCell(): boolean {
        const { selection } = this.#state;
        let result: boolean | undefined;
        selection?.visitRanges(range => result = result !== false && range instanceof FlowRange && range.focus === 0);
        return !!result;
    }

    isAtEndOfTableCell(): boolean {
        const { selection } = this.#state;
        let result: boolean | undefined;
        selection?.visitRanges((range, { target }) => (
            result = result !== false && target && range instanceof FlowRange && range.focus >= getEndOfFlow(target)
        ), this.getTargetOptions());
        return !!result;
    }

    getSelection(): FlowSelection | null {
        return this.#state.selection;
    }

    setSelection(selection: FlowSelection | null): void {
        this.#state = this.#apply(this.#state.set("selection", selection));
    }

    selectAll(): void {
        const endOfFlow = getEndOfFlow(this.#state.content);
        this.setSelection(new FlowRangeSelection({range: FlowRange.at(0, endOfFlow)}));
    }

    undo(): void {
        this.#state = this.#apply(this.#state.undo());
    }

    redo(): void {
        this.#state = this.#apply(this.#state.redo());
    }

    copy(): FlowContent[] {
        const { selection } = this.#state;
        const result: FlowContent[] = [];
        
        selection?.transformRanges((range, options) => {
            if (!options) {
                return null;
            }
            const { target } = options;
            if (!target) {
                return null;
            }
            result.push(target.copy(range));
            return range;
        }, this.getTargetOptions());

        return result;
    }

    copyJsonString(): string | null {
        const contentArray = this.copy();
        if (contentArray.length === 1) {
            return JSON.stringify(contentArray[0].toJsonValue());
        }
        else {
            return null;
        }
    }

    uploadAsset(blob: Blob): string {
        const id = nanoid();
        const store = this.#onStoreAsset;
        this.#uploads.set(id, blob);

        if (store) {
            (async () => {
                const args = new StoreAssetEvent(blob, id);
                try {
                    store(args);
                    await args._complete();
                    if (args.url === null) {
                        console.warn("Asset wasn't stored and will remain transient only.");
                    }
                } catch (error) {
                    console.error("Failed to store asset:", error);
                } finally {
                    if (args.url !== null) {
                        this.#state = this.#apply(new CompleteUpload({ id, url: args.url }));
                        this.#uploads.delete(id);
                    }
                }
            })();
        }

        return id;
    }

    getUpload(id: string): Blob | null {
        return this.#uploads.get(id) ?? null;
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

    increaseBaselineOffset(): void {
        const baseline = this.getBaselineOffset();
        console.log("current", baseline);
        if (baseline === "normal") {
            this.setBaselineOffset("super");
        } else if (baseline === "sub") {
            this.setBaselineOffset("normal");
        }
    }

    decreaseBaselineOffset(): void {
        const baseline = this.getBaselineOffset();
        if (baseline === "normal") {
            this.setBaselineOffset("sub");
        } else if (baseline === "super") {
            this.setBaselineOffset("normal");
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

    // TODO: spaceBefore
    // TODO: spaceAfter
    // TODO: listCounter
    // TODO: listCounterPrefix
    // TODO: listCounterSuffix

    getReadingDirection(): ParagraphStyleProps["direction"] {
        return this.getParagraphStyle().get("direction");
    }

    setReadingDirection(value: Exclude<ParagraphStyleProps["direction"], undefined>): void {
        this.formatParagraph("direction", value);
    }

    toggleTextStyle(key: BooleanTextStyleKeys): void {
        this.formatText(key, !this.getTextStyle().get(key));
    }

    getBoxStyle(): BoxStyle {
        const { selection, content, theme } = this.#state;
        return selection === null ? BoxStyle.empty : selection.getUniformBoxStyle(content, theme);
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

    removeBackward(): void {
        this.remove("removeBackward");
    }

    removeForward(): void {
        this.remove("removeForward");
    }

    remove(whenCollapsed: RemoveFlowSelectionOptions["whenCollapsed"] = "noop"): void {
        const { selection } = this.#state;
        if (selection) {
            const options: RemoveFlowSelectionOptions = {
                ...this.getTargetOptions(),
                whenCollapsed,
            };
            this.#state = this.#apply(selection?.remove(options));
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

    isMultiRange(): boolean {
        const { selection } = this.#state;
        let count = 0;
        if (selection) {
            selection.transformRanges(range => {
                ++count;
                return range;
            });
        }
        return count > 1;
    }

    insertBox(style?: BoxStyle, content?: FlowContent): void {
        const { selection, theme } = this.#state;
        
        if (!selection) {
            return;
        }
        
        if (!style) {
            style = BoxStyle.empty.set("variant", "outlined");
        }

        if (!content) {
            let paraStyle = this.getParagraphStyle();
            const ambient = theme.getParagraphTheme(paraStyle.variant ?? "normal").getAmbientParagraphStyle();
            paraStyle = paraStyle.unmerge(ambient.unset("variant"));
            const paraBreak = new ParagraphBreak({ style: paraStyle });
            if (selection.isCollapsed) {
                content = new FlowContent({ nodes: Object.freeze([paraBreak])});
            } else {
                const contentArray = this.copy();
                if (contentArray.length !== 1) {
                    return;
                }
                content = contentArray[0];
                if (content.size === 0 || !(content.peek(content.size - 1).node instanceof ParagraphBreak)) {
                    content = content.set("nodes", Object.freeze([...content.nodes, paraBreak]));
                }
            }            
        }        
        
        this.insertNode(new FlowBox({ content, style }));

        let selectionInsideBox: FlowSelection | undefined | null;
        selection.visitRanges((range, {wrap, target}) => {
            if (range instanceof FlowRange) {
                const box = target?.peek(range.first).node;
                if (box instanceof FlowBox) {
                    const endOfBoxContent = getEndOfFlow(box.content);
                    let cursor = box.content.peek(Math.max(0, box.content.size - 1));
                    while (cursor.node instanceof ParagraphBreak) {
                        const prev = cursor.moveToStartOfPreviousNode();
                        if (prev) {
                            cursor = prev;
                        } else {
                            break;
                        }
                    }
                    selectionInsideBox = wrap(new FlowBoxSelection({
                        position: range.first,
                        content: new FlowRangeSelection({
                            range: FlowRange.at(endOfBoxContent),
                        }),
                    }));
                }
            }
        }, this.getTargetOptions());

        if (selectionInsideBox) {
            this.setSelection(selectionInsideBox);
        }
    }

    insertTable(cols: number, rows: number): void {
        const { selection } = this.#state;
        if (cols > 0 && rows > 0 && selection && selection.isCollapsed) {
            const emptyCell = FlowTableCell.emptyParagraph;
            const cells = new Map<string, FlowTableCell>();
            cells.set(CellPosition.at(rows - 1, cols - 1).toString(), emptyCell);
            this.insertNode(new FlowTable({
                content: new FlowTableContent(cells, { defaultContent: emptyCell.content }),
                columns: new Map(),
                style: TableStyle.empty,
            }));
            let newSelection: FlowSelection | undefined | null;
            selection.visitRanges((range, {wrap}) => {
                if (range instanceof FlowRange && range.isCollapsed) {
                    newSelection = wrap(new FlowTableCellSelection({
                        position: range.first,
                        cell: CellPosition.at(0, 0),
                        content: new FlowRangeSelection({ range: FlowRange.at(0) }),
                    }));
                }
            }, this.getTargetOptions());
            if (newSelection) {
                this.setSelection(newSelection);
            }
        }
    }

    insertMarkup(tag: string): void {
        const { selection } = this.#state;
        
        if (!selection) {
            return;
        }

        const ops: FlowOperation[] = [];
        let newSelection: FlowSelection | undefined | null;
        selection.visitRanges((range, {wrap}) => {
            if (range instanceof FlowRange) {
                const start = wrap(FlowRange.at(range.first))?.insert(                    
                    new FlowContent({ nodes: Object.freeze([new StartMarkup({ tag, style: TextStyle.empty })])}),
                    this.getTargetOptions(),
                );
                
                const end = wrap(FlowRange.at(range.last))?.insert(                    
                    new FlowContent({ nodes: Object.freeze([new EndMarkup({ tag, style: TextStyle.empty })])}),
                    this.getTargetOptions(),
                );

                if (start && end) {
                    ops.push(end, start);
                    if (range.isCollapsed) {
                        newSelection = wrap(FlowRange.at(range.first + 1));
                    } else {
                        newSelection = null;
                    }
                }
            }
        });

        this.#state = this.#apply(FlowBatch.fromArray(ops));
        if (newSelection) {
            this.setSelection(newSelection);
        }
    }

    async insertContentOrPromise(content: FlowContent | Promise<FlowContent>): Promise<void> {
        if (FlowContent.classType.test(content)) {
            this.insertContent(content);
        } else {
            await this.insertPromise(content);
        }
    }

    async insertPromise(content: Promise<FlowContent>): Promise<void> {
        const { selection: designatedSelection } = this.#state;
        if (designatedSelection) {
            await content.then(resolved => {
                if (FlowSelection.baseType.equals(designatedSelection, this.#state.selection)) {
                    this.insertContent(resolved);
                }
            });
        }        
    }

    insertContent(content: FlowContent): void {
        const { selection } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.insert(content));
        }
    }

    getBoxInteraction(): Interaction | null | undefined {
        return this.getBoxStyle().interaction;
    }

    setBoxInteraction(value: Interaction | null): void {
        // TODO: Interaction should be unset when null, this should be accomplished by having ambient box style
        this.formatBox("interaction", value);
    }

    isAtEndOfTrailingParagraph(): boolean {
        const { selection } = this.#state;
        return selection !== null && null !== selection.transformRanges((range, options) => {
            if (options && options.target && range.last === options.target.size) {
                return range;
            } else {
                return null;
            }
        }, this.getTargetOptions());
    }

    isInEmptyListItem(): boolean {
        const { selection } = this.#state;
        return selection !== null && null !== selection.transformRanges((range, options) => {
            if (options && options.target && range.isCollapsed) {
                const cursor = options.target.peek(range.first);
                if (cursor.node instanceof ParagraphBreak) {
                    const { listLevel } = cursor.node.style;
                    if (
                        typeof listLevel === "number" && listLevel > 0 &&
                        (
                            cursor.position === 0 ||
                            cursor.moveToStartOfPreviousNode()?.node instanceof ParagraphBreak
                        )
                    ) {
                        return range;
                    }
                }
            }
            return null;
        }, this.getTargetOptions());
    }

    moveCaretBack(): boolean {
        const { selection } = this.#state;
        if (!selection) {
            return false;
        }
        const newSelection = selection.transformRanges(range => FlowRange.at(Math.max(0, range.first - 1)));
        this.#state = this.#apply(this.#state.set("selection", newSelection));
        return true;
    }

    isBox(): boolean {
        return this.isUniformNodes(node => node instanceof FlowBox);
    }

    isDynamicText(): boolean {
        return this.isUniformNodes(node => node instanceof DynamicText);
    }

    isLink(): boolean {
        return this.isUniformNodes(node => node instanceof TextRun && !!node.style.link);
    }

    isIcon(): boolean {
        return this.isUniformNodes(node => node instanceof FlowIcon);
    }

    getIcon(): string | null {
        let icon: string | null | undefined;
        this.forEachNode(node => {
            if (node instanceof FlowIcon && (icon === void(0) || icon === node.data)) {
                icon = node.data;
            } else {
                icon = null;
            }
        });
        return icon ?? null;
    }

    setIcon(data: string): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.setIcon(content, data));
        }
    }

    isImage(): boolean {
        return this.isUniformNodes(node => node instanceof FlowImage);
    }

    getImageSource(): ImageSource | null {
        let image: ImageSource | null | undefined;
        this.forEachNode(node => {
            if (node instanceof FlowImage && image !== null && (image === void(0) || node.source.equals(image))) {
                image = node.source;
            } else {
                image = null;
            }
        });
        return image ?? null;
    }

    setImageSource(source: ImageSource): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.setImageSource(content, source));
        }
    }

    isUniformNodes(predicate: (node: FlowNode) => boolean): boolean {
        const { found, other } = this.matchNodes(predicate);
        return found && !other;
    }

    matchNodes(predicate: (node: FlowNode) => boolean): { found: boolean, other: boolean } {      
        let found = false;
        let other = false;
        this.forEachNode(node => {
            if (predicate(node)) {
                found = true;
            } else {
                other = true;
            }
        });
        return { found, other };
    }

    forEachNode(callback: (node: FlowNode) => void): void {
        const { selection } = this.#state;
        selection?.transformRanges((range, options = {}) => {
            const { target } = options;

            if (target) {
                for (const node of target.peek(range.first).range(range.size)) {
                    callback(node);
                }
            }

            return null;
        }, this.getTargetOptions());
    }

    getDynamicExpression(): string | null | undefined {
        if (this.isBox()) {
            return this.getBoxStyle().source;
        } else {
            return this.getDynamicTextExpression();
        }
    }

    setDynamicExpression(value: string | null): void {
        if (this.isBox()) {
            // TODO: Source should be unset when null, this should be accomplished by having ambient box style
            this.formatBox("source", value);
        } else if (value !== null) {
            this.setDynamicTextExpression(value);
        }
    }

    setDynamicTextExpression(value: string): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.setDynamicTextExpression(content, value));
        }
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

    isSpellcheckEnabled(): boolean | undefined {
        return this.getTextStyle().spellcheck;
    }

    toggleSpellcheck(): void {
        this.formatText("spellcheck", !this.isSpellcheckEnabled());
    }

    canMergeTableCells(): boolean {
        const { selection } = this.#state;
        let result: boolean | undefined;
        if (selection) {
            selection.visitRanges((range, {target, position}) => {
                const first = result === void(0);
                result = false;
                if (
                    range instanceof CellRange &&
                    !range.isSingleCell &&
                    typeof position === "number" &&
                    target &&
                    first
                ) {
                    const table = target.peek(position).node;
                    if (table instanceof FlowTable) {
                        result = true;
                        for (let r = range.firstRowIndex; r <= range.lastRowIndex; ++r) {
                            for (let c = range.firstColumnIndex; c <= range.lastColumnIndex; ++c) {
                                const cell = table.content.getCell(CellPosition.at(r, c));
                                if (!cell || cell.colSpan !== 1 || cell.rowSpan !== 1) {
                                    result = false;
                                }
                            }
                        }                        
                    }
                }
            }, this.getTargetOptions());
        }
        return !!result;
    }

    mergeTableCells(): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.mergeTableCell(content));
        }
    }

    canSplitTableCell(): boolean {
        const { selection } = this.#state;
        let result: boolean | undefined;
        if (selection) {
            selection.visitRanges((range, {target, position}) => {
                const first = result === void(0);
                result = false;
                if (
                    range instanceof CellRange &&
                    range.isSingleCell &&
                    typeof position === "number" &&
                    target &&
                    first
                ) {
                    const table = target.peek(position).node;
                    if (table instanceof FlowTable) {
                        const cell = table.content.getCell(CellPosition.at(
                            range.firstRowIndex,
                            range.firstColumnIndex
                        ));
                        if (cell) {
                            result = cell.colSpan > 1 || cell.rowSpan > 1;
                        }
                    }
                }
            }, this.getTargetOptions());
        }
        return !!result;
    }

    splitTableCell(): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.splitTableCell(content));
        }
    }

    insertTableRowBefore(): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.insertTableRowBefore(content));
        }
    }

    insertTableRowAfter(): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.insertTableRowAfter(content));
        }
    }

    insertTableColumnBefore(): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.insertTableColumnBefore(content));
        }
    }

    insertTableColumnAfter(): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.insertTableColumnAfter(content));
        }
    }

    removeTableRow(): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.removeTableRow(content));
        }
    }    

    removeTableColumn(): void {
        const { selection, content } = this.#state;
        if (selection) {
            this.#state = this.#apply(selection.removeTableColumn(content));
        }
    }    
}

export type BooleanTextStyleKeys = {
    [K in keyof TextStyleProps]-?: boolean extends TextStyleProps[K] ? K : never
}[keyof TextStyleProps];
