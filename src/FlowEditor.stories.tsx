import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor } from "./FlowEditor";

export default {
    title: "FlowEditor",
    component: FlowEditor,
} as ComponentMeta<typeof FlowEditor>;
  
const Template: ComponentStory<typeof FlowEditor> = (args) => <FlowEditor {...args} />;

export const Uncontrolled = Template.bind({});
Uncontrolled.args = {};

