import Icon from "@mdi/react";
import React, { FC } from "react";
import { FlowEditorCommands } from "./FlowEditorCommands";
import { createUseFlowStyles } from "./JssTheming";
import { TooltipToolButton } from "./TooltipToolButton";
import {
    mdiFormatBold,
    mdiFormatItalic,
    mdiFormatUnderline,
} from "@mdi/js";

/** @internal */
export interface TooltipToolbarProps {
    editor: FlowEditorCommands;
}

/** @internal */
export const TooltipToolbar: FC<TooltipToolbarProps> = ({editor}) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <BoldButton editor={editor}/>
            <ItalicButton editor={editor}/>
            <UnderlineButton editor={editor}/>
        </div>
    );
};

const useStyles = createUseFlowStyles("TooltipToolbar", () => ({
    root: {},
}));

const BoldButton: FC<TooltipToolbarProps> = ({editor}) => (
    <TooltipToolButton
        checked={editor.isBold()}
        onClick={editor.toggleBold.bind(editor)}
        children={<Icon path={mdiFormatBold} size={1}/>}
    />
);

const ItalicButton: FC<TooltipToolbarProps> = ({editor}) => (
    <TooltipToolButton
        checked={editor.isItalic()}
        onClick={editor.toggleItalic.bind(editor)}
        children={<Icon path={mdiFormatItalic} size={1}/>}
    />
);

const UnderlineButton: FC<TooltipToolbarProps> = ({editor}) => (
    <TooltipToolButton
        checked={editor.isUnderlined()}
        onClick={editor.toggleUnderline.bind(editor)}
        children={<Icon path={mdiFormatUnderline} size={1}/>}
    />
);
