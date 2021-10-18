import React, { FC } from "react";
import { FlowEditorCommands } from "../FlowEditorCommands";
import { createUseFlowStyles } from "../JssTheming";
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
import { MoreToolsButton } from "./MoreToolsButton";

/** @internal */
export interface ToolbarProps {
    commands: FlowEditorCommands;
}

/** @internal */
export const Toolbar: FC<ToolbarProps> = props => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.line}>
                <ParagraphVariantButton {...props}/>
                <ToolDivider/>
                <ToolGroup>
                    <BoldButton {...props}/>
                    <ItalicButton {...props}/>
                    <UnderlineButton {...props}/>
                    <StrikeButton {...props}/>
                </ToolGroup>
                <ToolDivider/>
                <ToolGroup>
                    <SubscriptButton {...props}/>
                    <SuperscriptButton {...props}/>
                </ToolGroup>
                <ToolDivider/>
                <TextColorButton {...props}/>
                <ToolDivider/>
                <MoreToolsButton {...props}/>
            </div>
            <div className={classes.line}>
                <ToolGroup>
                    <TextAlignLeftButton {...props}/>
                    <TextAlignCenterButton {...props}/>
                    <TextAlignRightButton {...props}/>
                    <TextAlignJustifyButton {...props}/>
                </ToolGroup>
                <ToolDivider/>
                <ToolGroup>
                    <UnorderedListButton {...props}/>
                    <OrderedListButton {...props}/>
                </ToolGroup>
                <ToolDivider/>
                <ToolGroup>
                    <DecrementListLevelButton {...props}/>
                    <IncrementListLevelButton {...props}/>
                </ToolGroup>
                <ToolDivider/>
                <InteractionButton {...props}/>
                <ToolDivider/>
                <DynamicExpressionButton {...props}/>
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
