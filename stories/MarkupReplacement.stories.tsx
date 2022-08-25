import { ComponentMeta, ComponentStory } from "@storybook/react";
import { JsonValue } from "paratype";
import React, { FC, ReactNode, useState } from "react";
import { FlowContent } from "scribing";
import { FlowView, RenderMarkupEvent } from "../src";

export default {
    title: "MarkupReplacement",
    component: FlowView,
} as ComponentMeta<typeof FlowView>;
  
const Template: ComponentStory<typeof FlowView> = args => <div><FlowView {...args}/></div>;

const onRenderMarkup = (event: RenderMarkupEvent) => {
    if (event.markup.tag === "Void") {
        event.result = null;
    } else if (event.markup.tag === "Defer") {
        event.defer(() => new Promise(resolve => setTimeout(resolve, 3000)));
    } else if (event.markup.tag === "Transclude") {
        event.result = FlowContent.fromJsonValue([
            "TRANSCLUDED CONTENT",
            { break: "para" }, 
        ]);
    } else if (event.markup.tag === "Custom") {
        event.defer(async () => {
            const label = (await Promise.all(event.markup.extract("Label").map(m => m.render())))[0];
            const children = await event.markup.render();
            event.result = <Custom children={children} label={label}/>;
        });
    }
};

const makeStory = (content: JsonValue) => {
    const bound = Template.bind({});
    bound.args = {
        content: FlowContent.fromJsonValue(content),
        skeleton: <div>PLEASE WAIT!</div>,
        onRenderMarkup,
    };
    return bound;
};

export const Unknown = makeStory([
    "The next paragraph contains: <Unknown/>",
    { break: "para" },
    { empty_markup: "Unknown" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const UnknownWithoutContent = makeStory([
    "The next paragraph contains: <Unknown></Unknown>",
    { break: "para" },
    { start_markup: "Unknown" },
    { end_markup: "Unknown" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const UnknownWithContent = makeStory([
    "The next paragraph contains: <Unknown>Hello world</Unknown>",
    { break: "para" },
    { start_markup: "Unknown" },
    "Hello world",
    { end_markup: "Unknown" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const VoidEmpty = makeStory([
    "The next paragraph contains: <Void/>",
    { break: "para" },
    { empty_markup: "Void" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const VoidWithoutContent = makeStory([
    "The next paragraph contains: <Void><Void>",
    { break: "para" },
    { start_markup: "Void" },
    { end_markup: "Void" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const VoidWithContent = makeStory([
    "The next paragraph contains: <Void>Hello world</Void>",
    { break: "para" },
    { start_markup: "Void" },
    "Hello world",
    { end_markup: "Void" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const MixedVoid = makeStory([
    "The next paragraph contains: Hello<Void> world</Void>",
    { break: "para" },
    "Hello",
    { start_markup: "Void" },
    " world",
    { end_markup: "Void" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const Defer = makeStory([
    "The next paragraph contains: <Defer>Stuff</Defer>",
    { break: "para" },
    { start_markup: "Defer" },
    "Stuff",
    { end_markup: "Defer" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const Transclude = makeStory([
    "The next paragraph contains: <Transclude/>",
    { break: "para" },
    { empty_markup: "Transclude" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const TranscludeInBox = makeStory([
    "This box contains: <Transclude/>",
    { break: "para" },
    { 
        box: [
            { empty_markup: "Transclude" },
            { break: "para" },
        ]
    },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const ConditionalTranscludeInBox = makeStory([
    "Here's a conditional box that contains: <Transclude/>",    
    { break: "para" },
    { 
        box: [ "Hide/Show" ],
        style: {
            variant: "outlined",
            interaction: {
                script: "ShowFragment = !ShowFragment"
            }
        }
    },
    { break: "para" },
    { 
        box: [
            { empty_markup: "Transclude" },
            { break: "para" },
        ],
        style: {
            source: "ShowFragment || null"
        }
    },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const TranscludeInTable = makeStory([
    "This table contains: <Transclude/>",
    { break: "para" },
    { 
        table: {
            A1: [
                { empty_markup: "Transclude" },
                { break: "para" },
            ]
        } 
    },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const MixedTransclude = makeStory([
    "The next paragraph contains: before<Transclude/>after",
    { break: "para" },
    "before",
    { empty_markup: "Transclude" },
    "after",
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const CustomEmpty = makeStory([
    "The next paragraph contains: <Custom/>",
    { break: "para" },
    { empty_markup: "Custom" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

export const CustomContent = makeStory([
    "The next paragraph contains: <Custom>foo<Label>message</Label>bar</Custom>",
    { break: "para" },
    { start_markup: "Custom" },
    "foo",
    { start_markup: "Label" },
    "message",
    { end_markup: "Label" },
    "bar",
    { end_markup: "Custom" },
    { break: "para" },
    "The end",
    { break: "para" },
]);

interface CustomProps {
    label?: ReactNode;    
}

const Custom: FC<CustomProps> = props => {
    const { label, children } = props;
    const [toggled, setToggled] = useState(false);
    return (
        <div style={{backgroundColor: toggled ? "yellow" : "transparent"}} onClick={() => setToggled(v => !v)}>
            <div>THIS IS A CUSTOM ELEMENT!</div>
            {label}
            <hr/>
            {children}
            <div>THIS THE END OF THE CUSTOM ELEMENT</div>
        </div>
    );
};