import Icon from "@mdi/react";
import React, { FC } from "react";
import { FlowEditorCommands } from "../FlowEditorCommands";
import { createUseFlowStyles } from "../JssTheming";
import { ToolButton } from "./ToolButton";
import {
    mdiFormatFont,
    mdiFormatSize,
    mdiGestureTapButton,
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
import { ToolGroup } from "./ToolGroup";
import { ToolDivider } from "./ToolDivider";
import { BoldButton } from "./BoldButton";
import { ItalicButton } from "./ItalicButton";
import { UnderlineButton } from "./UnderlineButton";
import { StrikeButton } from "./StrikeButton";
import { SubscriptButton } from "./SubscriptButton";
import { SuperscriptButton } from "./SuperscriptButton";
import { TextColorButton } from "./TextColorButton";
import { ParagraphVariantButton } from "./ParagraphVariantButton";

/** @internal */
export interface ToolbarProps {
    commands: FlowEditorCommands;
}

/** @internal */
export const Toolbar: FC<ToolbarProps> = ({commands}) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <ToolGroup>
                <BoldButton commands={commands}/>
                <ItalicButton commands={commands}/>
                <UnderlineButton commands={commands}/>
                <StrikeButton commands={commands}/>
            </ToolGroup>
            <ToolDivider/>
            <ToolGroup>
                <SubscriptButton commands={commands}/>
                <SuperscriptButton commands={commands}/>
            </ToolGroup>
            <ToolDivider/>
            <TextColorButton commands={commands}/>
            <ToolDivider/>
            <ToolGroup>
                <ToolButton><Icon path={mdiFormatAlignLeft}/></ToolButton>
                <ToolButton><Icon path={mdiFormatAlignCenter}/></ToolButton>
                <ToolButton><Icon path={mdiFormatAlignRight}/></ToolButton>
                <ToolButton><Icon path={mdiFormatAlignJustify}/></ToolButton>
            </ToolGroup>
            <ToolDivider/>
            <ToolGroup>
                <ToolButton><Icon path={mdiFormatListBulleted}/></ToolButton>
                <ToolButton><Icon path={mdiFormatListNumbered}/></ToolButton>
            </ToolGroup>
            <ParagraphVariantButton commands={commands}/>
            <ToolDivider/>
            <ToolGroup>
                <ToolButton><Icon path={mdiFormatIndentIncrease}/></ToolButton>
                <ToolButton><Icon path={mdiFormatIndentDecrease}/></ToolButton>
            </ToolGroup>
            <ToolDivider/>
            <ToolButton><Icon path={mdiFormatText}/></ToolButton>
            <ToolButton><Icon path={mdiFormatLineSpacing}/></ToolButton>
            <ToolButton><Icon path={mdiFormatFont}/></ToolButton>
            <ToolButton><Icon path={mdiFormatSize}/></ToolButton>
            <ToolButton><Icon path={mdiGestureTapButton}/></ToolButton>
            <ToolButton><Icon path={mdiFormatTextdirectionLToR}/></ToolButton>
            <ToolButton><Icon path={mdiFormatTextdirectionRToL}/></ToolButton>
        </div>
    );
};

const useStyles = createUseFlowStyles("Toolbar", () => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        padding: 4,
        maxWidth: 480,
    },
}));
