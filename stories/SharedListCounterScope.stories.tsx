import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { FlowContent } from "scribing";
import { FlowView, SharedListCounterScope } from "../src";

export default {
    title: "SharedListCounterScope",
    component: SharedListCounterScope,
} as ComponentMeta<typeof SharedListCounterScope>;
  
const Template: ComponentStory<typeof SharedListCounterScope> = args => (
    <SharedListCounterScope {...args}>
        <div>First block:</div>
        <FlowView content={FlowContent.fromJsonValue([
            "One", { break: "para", style: { listLevel: 1, listMarker: "ordered" } }
        ])} />
        <div>Second block:</div>
        <FlowView content={FlowContent.fromJsonValue([
            "Two", { break: "para", style: { listLevel: 1, listMarker: "ordered" } }
        ])} />
    </SharedListCounterScope>
);

export const Default = Template.bind({});
