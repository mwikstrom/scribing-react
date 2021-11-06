import { FlowContent } from "scribing";
import { getContentFromInput } from "./get-content-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const insertContent: InputHandler = (commands, event) => {
    const content = getContentFromInput(event, commands.getCaretStyle(), commands.getUploadManager());
    if (FlowContent.classType.test(content)) {
        commands.insertContent(content);
    } else if (content) {
        content.then(resolved => {
            commands.refresh();
            commands.insertContent(resolved);
        });
    }
};
