import React from "react";
import renderer from "react-test-renderer";
import { FlowEditor } from "../src";

describe("FlowEditor", () => {
    it("can render without props", () => {
        const component = renderer.create(<FlowEditor/>);
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});