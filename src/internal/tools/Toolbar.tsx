import React, { FC, useEffect, useState } from "react";
import { FlowEditorCommands } from "../../FlowEditorCommands";
import { ToolGroup } from "./ToolGroup";
import { ToolDivider } from "./ToolDivider";
import { BoldButton } from "./BoldButton";
import { ItalicButton } from "./ItalicButton";
import { UnderlineButton } from "./UnderlineButton";
import { StrikeButton } from "./StrikeButton";
import { SubscriptButton } from "./SubscriptButton";
import { SuperscriptButton } from "./SuperscriptButton";
import { ColorButton } from "./ColorButton";
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
import { createUseStyles } from "react-jss";
import { makeJssId } from "../utils/make-jss-id";
import { BoxVariantButton } from "./BoxVariantButton";

/** @internal */
export interface ToolbarProps {
    editingHost: HTMLElement | null;
    commands: FlowEditorCommands;
    boundary?: HTMLElement | null;
}

/** @internal */
export const Toolbar: FC<ToolbarProps> = props => {
    const { commands: givenCommands, ...rest } = props;
    const commands = useFreshCommands(givenCommands);
    const toolProps = { commands, ...rest };
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.line}>
                {commands.isBox() ? (
                    <BoxVariantButton {...toolProps}/>
                ) : (
                    <ParagraphVariantButton {...toolProps}/>
                )}                
                <ToolDivider/>
                <ToolGroup>
                    <BoldButton {...toolProps}/>
                    <ItalicButton {...toolProps}/>
                    <UnderlineButton {...toolProps}/>
                    <StrikeButton {...toolProps}/>
                </ToolGroup>
                <ToolDivider/>
                <ToolGroup>
                    <SubscriptButton {...toolProps}/>
                    <SuperscriptButton {...toolProps}/>
                </ToolGroup>
                <ToolDivider/>
                <ColorButton {...toolProps}/>
                <ToolDivider/>
                <MoreToolsButton {...toolProps}/>
            </div>
            <div className={classes.line}>
                <ToolGroup>
                    <TextAlignLeftButton {...toolProps}/>
                    <TextAlignCenterButton {...toolProps}/>
                    <TextAlignRightButton {...toolProps}/>
                    <TextAlignJustifyButton {...toolProps}/>
                </ToolGroup>
                <ToolDivider/>
                <ToolGroup>
                    <UnorderedListButton {...toolProps}/>
                    <OrderedListButton {...toolProps}/>
                </ToolGroup>
                <ToolDivider/>
                <ToolGroup>
                    <DecrementListLevelButton {...toolProps}/>
                    <IncrementListLevelButton {...toolProps}/>
                </ToolGroup>
                <ToolDivider/>
                <InteractionButton {...toolProps}/>
                <ToolDivider/>
                <DynamicExpressionButton {...toolProps}/>
            </div>
        </div>
    );
};

const useStyles = createUseStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        padding: 4,
    },
    line: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 2,
        paddingBottom: 2,
    }
}, {
    generateId: makeJssId("Toolbar"),
});

const useFreshCommands = (given: FlowEditorCommands) => {
    const [fresh, setFresh] = useState(given);
    useEffect(() => {
        let active = true;
        setFresh(given);
        const dispose = given._observe(next => {
            if (active) {
                setFresh(next);
            }
        });
        return () => {
            active = false;
            dispose();
        };
    },[given]);
    return fresh;
};
