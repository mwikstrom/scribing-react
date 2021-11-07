import { FlowContent, FlowSelection } from "scribing";
import { getContentFromInput } from "./get-content-from-input";
import { InputHandler } from "./InputHandler";

/** @internal */
export const insertContent: InputHandler = (commands, event) => {
    const content = getContentFromInput(event, commands);
    if (FlowContent.classType.test(content)) {
        commands.insertContent(content);
    } else if (content) {
        const selection = commands.getSelection();
        if (selection) {
            content.then(resolved => {
                if (FlowSelection.baseType.equals(selection, commands.getSelection())) {
                    commands.insertContent(resolved);
                }
            });
        }        
    }
};
