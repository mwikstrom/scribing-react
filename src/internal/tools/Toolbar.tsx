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
    mdiFormatLineSpacing,
    mdiFunctionVariant,
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
import { TextAlignLeftButton } from "./TextAlignLeftButton";
import { TextAlignCenterButton } from "./TextAlignCenterButton";
import { TextAlignRightButton } from "./TextAlignRightButton";
import { TextAlignJustifyButton } from "./TextAlignJustifyButton";
import { IncrementListLevelButton } from "./IncrementListLevelButton";
import { DecrementListLevelButton } from "./DecrementListLevelButton";
import { UnorderedListButton } from "./UnorderedListButton";
import { OrderedListButton } from "./OrderedListButton";

/** @internal */
export interface ToolbarProps {
    commands: FlowEditorCommands;
}

/** @internal */
export const Toolbar: FC<ToolbarProps> = ({commands}) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <ParagraphVariantButton commands={commands}/>
            <ToolDivider/>
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
            <ToolButton><Icon path={mdiGestureTapButton}/></ToolButton>
            <ToolButton><Icon path={mdiFunctionVariant}/></ToolButton>
            <ToolGroup>
                <TextAlignLeftButton commands={commands}/>
                <TextAlignCenterButton commands={commands}/>
                <TextAlignRightButton commands={commands}/>
                <TextAlignJustifyButton commands={commands}/>
            </ToolGroup>
            <ToolDivider/>
            <ToolGroup>
                <UnorderedListButton commands={commands}/>
                <OrderedListButton commands={commands}/>
            </ToolGroup>
            <ToolDivider/>
            <ToolGroup>
                <IncrementListLevelButton commands={commands}/>
                <DecrementListLevelButton commands={commands}/>
            </ToolGroup>
            <ToolDivider/>
            <ToolButton><Icon path={mdiFormatLineSpacing}/></ToolButton>
            <ToolButton><Icon path={mdiFormatFont}/></ToolButton>
            <ToolButton><Icon path={mdiFormatSize}/></ToolButton>
            <ToolDivider/>
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
