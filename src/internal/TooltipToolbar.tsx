import Icon, { Stack } from "@mdi/react";
import React, { FC } from "react";
import { FlowEditorCommands } from "./FlowEditorCommands";
import { createUseFlowStyles } from "./JssTheming";
import { TooltipToolButton } from "./TooltipToolButton";
import {
    mdiFormatBold,
    mdiFormatItalic,
    mdiFormatUnderline,
    mdiFormatStrikethrough,
    mdiFormatSubscript,
    mdiFormatSuperscript,
    mdiFormatFont,
    mdiFormatSize,
    mdiGestureTapButton,
    mdiFormatColorFill,
    mdiColorHelper,
    mdiFormatTextdirectionLToR,
    mdiFormatTextdirectionRToL,
    mdiFormatAlignLeft,
    mdiFormatAlignCenter,
    mdiFormatAlignRight,
    mdiFormatAlignJustify,
    mdiFormatText,
    mdiFormatLineSpacing,
    mdiFormatListBulleted,
    mdiFormatListNumbered,
    mdiFormatIndentDecrease,
    mdiFormatIndentIncrease,
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
            <StrikeButton editor={editor}/>
            <SubscriptButton editor={editor}/>
            <SuperscriptButton editor={editor}/>
            <TooltipToolButton><Icon path={mdiFormatAlignLeft}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatAlignCenter}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatAlignRight}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatAlignJustify}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatListBulleted}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatListNumbered}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatIndentDecrease}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatIndentIncrease}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatText}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatLineSpacing}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatFont}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatSize}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiGestureTapButton}/></TooltipToolButton>
            <TooltipToolButton>
                <Stack>
                    <Icon path={mdiFormatColorFill}/>
                    <Icon path={mdiColorHelper}/>
                </Stack>
            </TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatTextdirectionLToR}/></TooltipToolButton>
            <TooltipToolButton><Icon path={mdiFormatTextdirectionRToL}/></TooltipToolButton>
        </div>
    );
};

const useStyles = createUseFlowStyles("TooltipToolbar", () => ({
    root: {
        padding: 4,
        maxWidth: 480,
    },
}));

const BoldButton: FC<TooltipToolbarProps> = ({editor}) => (
    <TooltipToolButton
        checked={editor.isBold()}
        onClick={editor.toggleBold.bind(editor)}
        children={<Icon path={mdiFormatBold}/>}
    />
);

const ItalicButton: FC<TooltipToolbarProps> = ({editor}) => (
    <TooltipToolButton
        checked={editor.isItalic()}
        onClick={editor.toggleItalic.bind(editor)}
        children={<Icon path={mdiFormatItalic}/>}
    />
);

const UnderlineButton: FC<TooltipToolbarProps> = ({editor}) => (
    <TooltipToolButton
        checked={editor.isUnderlined()}
        onClick={editor.toggleUnderline.bind(editor)}
        children={<Icon path={mdiFormatUnderline}/>}
    />
);

const StrikeButton: FC<TooltipToolbarProps> = ({editor}) => (
    <TooltipToolButton
        checked={editor.isStricken()}
        onClick={editor.toggleStrike.bind(editor)}
        children={<Icon path={mdiFormatStrikethrough}/>}
    />
);

const SubscriptButton: FC<TooltipToolbarProps> = ({editor}) => (
    <TooltipToolButton
        checked={editor.isSubscript()}
        onClick={editor.toggleSubscript.bind(editor)}
        children={<Icon path={mdiFormatSubscript}/>}
    />
);

const SuperscriptButton: FC<TooltipToolbarProps> = ({editor}) => (
    <TooltipToolButton
        checked={editor.isSuperscript()}
        onClick={editor.toggleSuperscript.bind(editor)}
        children={<Icon path={mdiFormatSuperscript}/>}
    />
);
