/** @public */
declare interface InputEvent {
    getTargetRanges(): readonly StaticRange[];
    readonly dataTransfer: DataTransfer;
}