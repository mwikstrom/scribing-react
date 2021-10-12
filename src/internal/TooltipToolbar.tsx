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
    commands: FlowEditorCommands;
}

/** @internal */
export const TooltipToolbar: FC<TooltipToolbarProps> = ({commands}) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <BoldButton commands={commands}/>
            <ItalicButton commands={commands}/>
            <UnderlineButton commands={commands}/>
            <StrikeButton commands={commands}/>
            <SubscriptButton commands={commands}/>
            <SuperscriptButton commands={commands}/>
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

const BoldButton: FC<TooltipToolbarProps> = ({commands}) => (
    <TooltipToolButton
        checked={commands.isBold()}
        onClick={commands.toggleBold.bind(commands)}
        children={<Icon path={mdiFormatBold}/>}
    />
);

const ItalicButton: FC<TooltipToolbarProps> = ({commands}) => (
    <TooltipToolButton
        checked={commands.isItalic()}
        onClick={commands.toggleItalic.bind(commands)}
        children={<Icon path={mdiFormatItalic}/>}
    />
);

const UnderlineButton: FC<TooltipToolbarProps> = ({commands}) => (
    <TooltipToolButton
        checked={commands.isUnderlined()}
        onClick={commands.toggleUnderline.bind(commands)}
        children={<Icon path={mdiFormatUnderline}/>}
    />
);

const StrikeButton: FC<TooltipToolbarProps> = ({commands}) => (
    <TooltipToolButton
        checked={commands.isStricken()}
        onClick={commands.toggleStrike.bind(commands)}
        children={<Icon path={mdiFormatStrikethrough}/>}
    />
);

const SubscriptButton: FC<TooltipToolbarProps> = ({commands}) => (
    <TooltipToolButton
        checked={commands.isSubscript()}
        onClick={commands.toggleSubscript.bind(commands)}
        children={<Icon path={mdiFormatSubscript}/>}
    />
);

const SuperscriptButton: FC<TooltipToolbarProps> = ({commands}) => (
    <TooltipToolButton
        checked={commands.isSuperscript()}
        onClick={commands.toggleSuperscript.bind(commands)}
        children={<Icon path={mdiFormatSuperscript}/>}
    />
);
