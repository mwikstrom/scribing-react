import Icon from "@mdi/react";
import React, { FC } from "react";
import { FlowEditorCommands } from "../FlowEditorCommands";
import { createUseFlowStyles } from "../JssTheming";
import { ToolButton } from "./ToolButton";
import { mdiDotsVertical } from "@mdi/js";
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
import { InteractionButton } from "./InteractionButton";
import { DynamicExpressionButton } from "./DynamicExpressionButton";

/** @internal */
export interface ToolbarProps {
    commands: FlowEditorCommands;
}

/** @internal */
export const Toolbar: FC<ToolbarProps> = ({commands}) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.line}>
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
                <ToolButton disabled><Icon path={mdiDotsVertical}/></ToolButton>
            </div>
            <div className={classes.line}>
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
                    <DecrementListLevelButton commands={commands}/>
                    <IncrementListLevelButton commands={commands}/>
                </ToolGroup>
                <ToolDivider/>
                <InteractionButton commands={commands}/>
                <ToolDivider/>
                <DynamicExpressionButton commands={commands}/>
            </div>
        </div>
    );
};

const useStyles = createUseFlowStyles("Toolbar", () => ({
    root: {
        display: "flex",
        flexDirection: "column",
        padding: 4,
    },
    line: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    }
}));
