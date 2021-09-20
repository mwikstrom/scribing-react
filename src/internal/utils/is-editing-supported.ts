export function isEditingSupported(): boolean {
    if (CACHE === void(0)) {
        CACHE = (
            typeof InputEvent.prototype.getTargetRanges === "function"
        );

        if (!CACHE && !navigator.userAgent.includes("jsdom")) {
            console.error("Editing is not supported in this environment :-(");
        }
    }

    return CACHE;
}

let CACHE: boolean | undefined;