import Icon, { Stack } from "@mdi/react";
import React, { FC } from "react";
import { FlowEditorCommands } from "./FlowEditorCommands";
import { createUseFlowStyles } from "./JssTheming";
import { ToolButton } from "./ToolButton";
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
export interface ToolbarProps {
    commands: FlowEditorCommands;
}

/** @internal */
export const Toolbar: FC<ToolbarProps> = ({commands}) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <BoldButton commands={commands}/>
            <ItalicButton commands={commands}/>
            <UnderlineButton commands={commands}/>
            <StrikeButton commands={commands}/>
            <SubscriptButton commands={commands}/>
            <SuperscriptButton commands={commands}/>
            <ToolButton><Icon path={mdiFormatAlignLeft}/></ToolButton>
            <ToolButton><Icon path={mdiFormatAlignCenter}/></ToolButton>
            <ToolButton><Icon path={mdiFormatAlignRight}/></ToolButton>
            <ToolButton><Icon path={mdiFormatAlignJustify}/></ToolButton>
            <ToolButton><Icon path={mdiFormatListBulleted}/></ToolButton>
            <ToolButton><Icon path={mdiFormatListNumbered}/></ToolButton>
            <ToolButton><Icon path={mdiFormatIndentDecrease}/></ToolButton>
            <ToolButton><Icon path={mdiFormatIndentIncrease}/></ToolButton>
            <ToolButton><Icon path={mdiFormatText}/></ToolButton>
            <ToolButton><Icon path={mdiFormatLineSpacing}/></ToolButton>
            <ToolButton><Icon path={mdiFormatFont}/></ToolButton>
            <ToolButton><Icon path={mdiFormatSize}/></ToolButton>
            <ToolButton><Icon path={mdiGestureTapButton}/></ToolButton>
            <ToolButton>
                <Stack>
                    <Icon path={mdiFormatColorFill}/>
                    <Icon path={mdiColorHelper}/>
                </Stack>
            </ToolButton>
            <ToolButton><Icon path={mdiFormatTextdirectionLToR}/></ToolButton>
            <ToolButton><Icon path={mdiFormatTextdirectionRToL}/></ToolButton>
        </div>
    );
};

const useStyles = createUseFlowStyles("Toolbar", () => ({
    root: {
        padding: 4,
        maxWidth: 480,
    },
}));

const BoldButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isBold()}
        onClick={commands.toggleBold.bind(commands)}
        children={<Icon path={mdiFormatBold}/>}
    />
);

const ItalicButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isItalic()}
        onClick={commands.toggleItalic.bind(commands)}
        children={<Icon path={mdiFormatItalic}/>}
    />
);

const UnderlineButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isUnderlined()}
        onClick={commands.toggleUnderline.bind(commands)}
        children={<Icon path={mdiFormatUnderline}/>}
    />
);

const StrikeButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isStricken()}
        onClick={commands.toggleStrike.bind(commands)}
        children={<Icon path={mdiFormatStrikethrough}/>}
    />
);

const SubscriptButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isSubscript()}
        onClick={commands.toggleSubscript.bind(commands)}
        children={<Icon path={mdiFormatSubscript}/>}
    />
);

const SuperscriptButton: FC<ToolbarProps> = ({commands}) => (
    <ToolButton
        active={commands.isSuperscript()}
        onClick={commands.toggleSuperscript.bind(commands)}
        children={<Icon path={mdiFormatSuperscript}/>}
    />
);
