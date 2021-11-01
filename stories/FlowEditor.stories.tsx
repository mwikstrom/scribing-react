import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor } from "../src/FlowEditor";
import { FlowEditorProps } from "../src";
import {
    BoxVariant,
    BOX_VARIANTS,
    FlowColor,
    FlowContent,
    FlowEditorState,
    FlowSelection,
    FLOW_COLORS
} from "scribing";
import { JsonObject, JsonValue } from "paratype";

export default {
    title: "FlowEditor",
    component: FlowEditor,
} as ComponentMeta<typeof FlowEditor>;
  
const Template: ComponentStory<typeof FlowEditor> = args => {
    const [state, setState] = useState(args.defaultState ?? FlowEditorState.empty);
    const [jsonState, setJsonState] = useState("");
    useEffect(() => {
        const timerId = setTimeout(
            () => setJsonState(JSON.stringify(FlowEditorState.dataType.toJsonValue(state.toData()), undefined, " ")),
            250
        );
        return () => clearTimeout(timerId);
    }, [state]);
    const onStateChange = useCallback<Exclude<FlowEditorProps["onStateChange"], undefined>>(
        state => void(setState(state)),
        [setState]
    );
    const wrapperStyle = useMemo<CSSProperties>(() => ({
        display: "flex",
        flexDirection: "row",
        height: "calc(100vh - 2rem - 2px)",
        border: "1px solid #888",
    }), []);
    const editorStyle = useMemo<CSSProperties>(() => ({
        flex: 0.5,
        overflow: "auto",
    }), []);
    const jsonStyle = useMemo<CSSProperties>(() => ({
        flex: 0.5,
        overflow: "auto",
        borderLeft: "1px solid #888",
        padding: 10,
        margin: 0,
    }), []);
    return (
        <div style={wrapperStyle}>
            <FlowEditor {...args} style={editorStyle} onStateChange={onStateChange}/>
            <pre style={jsonStyle}>{jsonState}</pre>
        </div>
    );
};

export const Empty = Template.bind({});
Empty.args = {};

export const TextOnly = Template.bind({});
TextOnly.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Hello world!"
    ])),
};

export const TextOnlyWithInitialSelection = Template.bind({});
TextOnlyWithInitialSelection.args = {
    defaultState: FlowEditorState.empty.merge({
        content: FlowContent.fromJsonValue([
            "Hello world!"
        ]),
        selection: FlowSelection.fromJsonValue({
            range: [6, 11]
        }),
    }),
};

export const TextOnlyWithInitialSelectionAndAutoFocus = Template.bind({});
TextOnlyWithInitialSelectionAndAutoFocus.args = {
    autoFocus: true,
    defaultState: FlowEditorState.empty.merge({
        content: FlowContent.fromJsonValue([
            "Hello world!"
        ]),
        selection: FlowSelection.fromJsonValue({
            range: [6, 11]
        }),
    }),
};

export const TwoParas = Template.bind({});
TwoParas.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Hello",
        { break: "line" },
        { text: "there", style: { italic: true } },
        { break: "para" },
        "world",
        { break: "para" },
    ])),
};

export const TrailingPara = Template.bind({});
TrailingPara.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Hello",
        { break: "line" },
        { text: "there", style: { italic: true } },
        { break: "para" },
        "world",
    ])),
};

export const Button = Template.bind({});
Button.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Let's try a button:",
        { break: "para" },
        button([
            "Hello ",
            { text: "world", style: { italic: true } },
            "!",
        ]),        
        { break: "para" },
        "The end.",
        { break: "para" },
    ])),
};

export const InlineButton = Template.bind({});
InlineButton.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Let's try an inline button: ",
        button([
            "Hello ",
            { text: "world", style: { italic: true } },
            "!",
        ]),        
        " The end.",
        { break: "para" },
    ])),
};

export const NestedButton = Template.bind({});
NestedButton.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Can a ",
        button([
            "button be ",
            button(["nested inside"]),
            " another",
        ]),        
        " button?",
        { break: "para" },
    ])),
};

export const Rich = Template.bind({});
Rich.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Title",
        { break: "para", style: { variant: "title" } },
        "Subtitle",
        { break: "para", style: { variant: "subtitle" } },
        "A preamble text",
        { break: "para", style: { variant: "preamble" } },
        "Normal text",
        { break: "para" },
        "Let's try an icon ", { icon: "information" }, ", did it work?",
        { break: "para" },
        "Heading level 2",
        { break: "para", style: { variant: "h2" } },
        "Normal text ",
        { text: "with a link", style: { link: "https://google.com/" } },
        ".",
        { break: "para" },
        "Disc bullet 1",
        { break: "para", style: { listLevel: 1 } },
        "Disc bullet 2",
        { break: "para", style: { listLevel: 1 } },        
        "Dash bullet",
        { break: "para", style: { listLevel: 1, listMarker: "dash" } },        
        "Disc bullet 3",
        { break: "para", style: { listLevel: 2, variant: "h3" } },        
        "Disc bullet 4",
        { break: "para", style: { listLevel: 3 } },        
        "Numeric bullet 5",
        { break: "para", style: { listLevel: 3, listMarker: "ordered" } },
        "Inside numeric bullet 5",
        { break: "para", style: { listLevel: 3, listMarker: "ordered", hideListMarker: true } },
        "Numeric bullet 5b",
        { break: "para", style: { listLevel: 3, listMarker: "ordered" } },
        "Numeric bullet 5c",
        { break: "para", style: { listLevel: 3, listMarker: "ordered" } },
        "Numeric bullet RESET",
        { break: "para", style: { listLevel: 3, listMarker: "ordered", listCounter: 23 } },
        "Numeric bullet 5d",
        { break: "para", style: { listLevel: 3, listMarker: "ordered" } },
        "Numeric bullet 6",
        { break: "para", style: { listLevel: 4, listMarker: "ordered", variant: "code" } },
        "Numeric bullet 7",
        { break: "para", style: { listLevel: 5, listMarker: "ordered", variant: "h2" } },
        "Numeric bullet 8",
        { break: "para", style: { listLevel: 3, listMarker: "ordered" } },
        "Numeric bullet 9",
        { break: "para", style: { listLevel: 4, listMarker: "ordered" } },
        "Some code",
        { break: "para", style: { variant: "code" } },
        "Disc bullet 1",
        { break: "para", style: { listLevel: 1, listMarker: "ordered", listCounter: "resume" } },
        "Some code",
        { break: "para", style: { variant: "code" } },
        "Disc bullet 1",
        { break: "para", style: { listLevel: 1, listMarker: "ordered" } },
        "Let's try colors: ",
        { text: "primary", style: { color: "primary" } }, 
        " ",
        { text: "secondary", style: { color: "secondary" } }, 
        " ",
        { text: "subtle", style: { color: "subtle" } }, 
        " ",
        { text: "warning", style: { color: "warning" } }, 
        " ",
        { text: "error", style: { color: "error" } }, 
        " ",
        { text: "information", style: { color: "information" } }, 
        " ",
        { text: "success", style: { color: "success" } }, 
        " ",
    ])),
};

export const Counter = Template.bind({});
Counter.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Counter value is: ",
        { dynamic: "value || 0" },
        ". ",
        button(["Increment"], "value = (value || 0) + 1" ),
        { break: "para" },
    ])),
};

export const StyledCounter = Template.bind({});
StyledCounter.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Counter value is: ",
        { dynamic: `{
\tif (!value) {
\t\treturn { text: "zero", style: { color: "subtle" } };
\t}

\tconst suffix = ["th","st","nd","rd","th"][Math.min(value % 20, 4)];
\tconst color = value < 5 ? "default" : value < 10 ? "success" : value < 20 ? "warning" : "error";

\treturn [
\t\t{ text: String(value), style: { color, bold: true } },
\t\t{ text: suffix, style: { color, italic: true, baseline: "super" } },
\t];
}` },
        { break: "para" },
        button(["Increment"], "value = (value || 0) + 1"),
        " ",
        button(["Double-up"], "value *= 2"),
        " ",
        button(["Reset"], "value = 0"),
        { break: "para" },
    ])),
};

export const DynamicTextStates = Template.bind({});
DynamicTextStates.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "This should be an error: ", { dynamic: "bad.stuff()" },
        { break: "para" },
        "This should be \"OK\": ", { dynamic: "'OK'" },
        { break: "para" },
        "This should fail after 1 second: ", { dynamic: "{ await delay(1000); throw new Error('Failure'); }" },
        { break: "para" },
        "This should resolve to \"OK\" after 1 second: ", { dynamic: "{ await delay(1000); return 'OK' }" },
        { break: "para" },
        "This should be null: ", { dynamic: "null" },
        { break: "para" },
        "This should be empty: ", { dynamic: "''" },
        { break: "para" },
        "This is an empty expression: ", { dynamic: "" },
    ])),
};

export const ButtonStates = Template.bind({});
ButtonStates.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "This button should fail immediately: ",
        button(["Click me"], "{ throw new Error('Failed'); }"),
        { break: "para" },
        "This button should fail after 1 second: ",
        button(["Click me"], "{ await delay(1000); throw new Error('Failed'); }"),
        { break: "para" },
        "This button should succeed after 1 second: ",
        button(["Click me"], "delay(1000)"),
        { break: "para" },
    ])),
};


export const LinkStates = Template.bind({});
LinkStates.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "This link should fail immediately: ",
        { text: "Click me", style: { link: { script: "{ throw new Error('Failed'); }" } } },
        { break: "para" },
        "This link should fail after 1 second: ",
        { text: "Click me", style: { link: { script: "{ await delay(1000); throw new Error('Failed'); }" } } },
        { break: "para" },
        "This link should succeed after 1 second: ",
        { text: "Click me", style: { link: { script: "delay(1000)" } } },
        { break: "para" },
    ])),
};

export const FullWidthBox = Template.bind({});
FullWidthBox.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Before",
        { break: "para" },
        { box: ["Inside"], style: { variant: "outlined", inline: false } },
        { break: "para" },
        "After",
        { break: "para" },
    ])).set("formattingMarks", true),
};

export const FullWidthBoxWithoutParaBreaks = Template.bind({});
FullWidthBoxWithoutParaBreaks.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Before",
        { box: ["Inside"], style: { variant: "outlined", inline: false } },
        "After",
        { break: "para" },
    ])).set("formattingMarks", true),
};

export const BoxVariants = Template.bind({});
BoxVariants.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue(
        BOX_VARIANTS.flatMap(variant => FLOW_COLORS.flatMap(color => [
            button([`${variant} ${color}`], { variant, color }),
            { "break": "para"},
        ])),
    )),
};

export const Progress = Template.bind({});
Progress.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "This progress indicator should be auto-refreshing:",
        { break: "para" },
        { 
            dynamic: `
            {
                this.refresh = 500;
                return progress >= 0 ? progress + "%" : "Idle";
            }
            `,
        },
        { break: "para" },
        button(["Run"], `
        {
            for (let i = 0; i <= 100; i += 3) {
                progress = i;
                await delay(250);
            }
            progress = undefined;
        }`),
    ])),
};

export const DataSourceSingle = Template.bind({});
DataSourceSingle.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Binding a single value:",
        { break: "para" },
        { 
            box: [
                "Hello ",
                { dynamic: "data" },
                "!",
            ],
            style: {
                source: "'world'",
                inline: false,
            }
        },
        { break: "para" },
        "The end.",
        { break: "para" },
    ])),
};

export const DataSourceSingleDelayed = Template.bind({});
DataSourceSingleDelayed.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Binding a single delayed value:",
        { break: "para" },
        { 
            box: [
                "Hello ",
                { dynamic: "data" },
                "!",
            ],
            style: {
                source: "{ await delay(2000); return 'world'; }",
                inline: false,
            }
        },
        { break: "para" },
        "The end.",
        { break: "para" },
    ])),
};

export const DataSourceError = Template.bind({});
DataSourceError.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Binding error:",
        { break: "para" },
        { 
            box: [
                "Hello ",
                { dynamic: "data" },
                "!",
            ],
            style: {
                source: "{ throw new Error('This is an intentional error'); }",
                inline: false,
            }
        },
        { break: "para" },
        "The end.",
        { break: "para" },
    ])),
};

export const DataSourceHidden = Template.bind({});
DataSourceHidden.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Hidden (false binding):",
        { break: "para" },
        { 
            box: ["This should be hidden"],
            style: {
                source: "false",
                inline: false,
            }
        },
        { break: "para" },
        "The end.",
        { break: "para" },
    ])),
};

export const DataSourceMultiOutput = Template.bind({});
DataSourceMultiOutput.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Multi-binding:",
        { break: "para" },
        { 
            box: [
                "Message #",
                { dynamic: "data.index" },
                ": ",
                { dynamic: "data.message" },
                { break: "para", style: { listLevel: 1, listMarker: "ordered" } },
            ],
            style: {
                source: "['this', 'is', 'useful'].map((message, index) => ({ message, index}))",
                inline: false,
            }
        },
        { break: "para" },
        "The end.",
        { break: "para" },
    ])),
};

export const DataSourceMultiOutputInAlert = Template.bind({});
DataSourceMultiOutputInAlert.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Multi-binding:",
        { break: "para" },
        { 
            box: [
                "Message #",
                { dynamic: "data.index" },
                ": ",
                { dynamic: "data.message" },
                { break: "para"},
            ],
            style: {
                source: "['this', 'is', 'useful'].map((message, index) => ({ message, index}))",
                inline: false,
                variant: "alert",
                color: "warning",
            }
        },
        { break: "para" },
        "The end.",
        { break: "para" },
    ])),
};

export const DataSourceDelayedMultiOutput = Template.bind({});
DataSourceDelayedMultiOutput.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Delayed multi-binding:",
        { break: "para" },
        { 
            box: [{ dynamic: "data" }],
            style: {
                source: "{ await delay(3000); return [11,22,33]; }",
                inline: false,
            }
        },
        { break: "para" },
        "The end.",
        { break: "para" },
    ])),
};

export const LoremIpsum = Template.bind({});
LoremIpsum.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        // eslint-disable-next-line max-len
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus tortor vitae dui aliquet, sed luctus massa viverra. Donec sed tortor sapien. Morbi iaculis, orci at volutpat consectetur, ligula sem efficitur ante, ut ultricies neque diam vitae enim. Morbi sed sem ante. Pellentesque tincidunt consectetur mauris, vitae dignissim arcu. Donec pulvinar massa vitae diam condimentum aliquet. Nullam euismod nibh felis, ut tristique mi aliquam quis. Praesent efficitur, felis ut scelerisque sagittis, nunc tortor fringilla quam, ut euismod ipsum ex nec enim. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin iaculis ex ac nibh ultricies feugiat vel at lorem. In sollicitudin, turpis in sodales hendrerit, dui sem hendrerit leo, ac pellentesque massa dui sed turpis. Curabitur nulla lorem, tempor et porttitor at, sollicitudin at mi.",
        { break: "para" },
        // eslint-disable-next-line max-len
        "Vestibulum eget augue vitae orci pellentesque venenatis et eu felis. Aliquam et leo ac ligula vehicula pellentesque. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum eget bibendum nunc, a elementum diam. Interdum et malesuada fames ac ante ipsum primis in faucibus. Ut est ipsum, varius ac malesuada at, eleifend sed justo. Pellentesque consequat, ante a dictum varius, lacus ipsum convallis ante, eu condimentum lacus erat in velit. Quisque blandit volutpat interdum.",
        { break: "para" },
        // eslint-disable-next-line max-len
        "Curabitur sed ante id lacus eleifend egestas at nec ante. Aliquam a diam dictum, congue ligula vitae, lobortis diam. Vestibulum eu lacinia mi. Aenean feugiat tellus ut eleifend fermentum. Vivamus iaculis vel turpis a tincidunt. Nulla cursus nulla vel mauris accumsan blandit. Integer rutrum leo tellus, at laoreet orci vulputate mattis. Etiam convallis nec dui sit amet posuere. Suspendisse non tortor urna. Fusce ultricies pharetra dui, vitae lacinia diam sagittis fermentum. Donec vitae eros non purus lacinia feugiat. Duis lacinia egestas tempor. Curabitur ipsum ante, tempor sit amet imperdiet ut, porta non erat. Donec euismod massa risus. Nam et purus lorem. Quisque pellentesque eleifend nisl eu efficitur.",
        { break: "para" },
        // eslint-disable-next-line max-len
        "Morbi porta nisi risus, at elementum lectus congue ac. Maecenas commodo ultrices dictum. Mauris diam purus, vulputate in velit sit amet, imperdiet faucibus felis. Sed hendrerit lacinia metus at faucibus. Nunc nec laoreet metus. Nullam hendrerit eget risus ut aliquam. Pellentesque eget elementum justo. Fusce ullamcorper ex vel mauris tincidunt pharetra. Integer dapibus tortor vitae consectetur sollicitudin. Ut eleifend non tortor eget ultricies. Sed consequat odio ac mi lacinia, vel pretium augue ullamcorper. In in blandit odio.",
        { break: "para" },
        // eslint-disable-next-line max-len
        "Integer malesuada fermentum quam. Fusce tincidunt at sem nec venenatis. Sed rhoncus blandit condimentum. In dignissim sed quam vehicula maximus. Nulla facilisi. Fusce ut leo viverra, iaculis magna nec, bibendum turpis. Suspendisse potenti. Pellentesque ac sapien fermentum eros tincidunt molestie interdum non tortor. Sed nisi nisi, posuere pulvinar neque at, tincidunt malesuada quam. Sed sed mi et ex dictum feugiat eu nec est. Donec maximus dui metus, in porta tortor volutpat lacinia. Ut nunc risus, vestibulum in tempor eu, laoreet non lectus. Ut vehicula, turpis nec luctus semper, lorem erat efficitur purus, in luctus dui magna nec lectus. Nam eget ullamcorper metus. Phasellus pretium lacinia feugiat. Maecenas lectus est, dapibus vitae lacinia eget, mattis at tortor.",
        { break: "para" },
    ])),
};

export const Alert = Template.bind({});
Alert.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        {
            box: [
                { icon: "warning" },
                { text: " Warning!", style: { bold: true } },
                { break: "para" },
                "This is a warning alert - check it out!",
                { break: "para" },
            ],
            style: {
                variant: "alert",
                color: "warning"
            }
        },
        { break: "para" },
    ])),
};

export const AlertWithHeading = Template.bind({});
AlertWithHeading.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        {
            box: [
                { icon: "warning" },
                { text: " Warning!" },
                { break: "para", style: { variant: "h1" } },
                "This is a warning alert - check it out!",
                { break: "para" },
            ],
            style: {
                variant: "alert",
                color: "warning"
            }
        },
        { break: "para" },
    ])),
};

export const Icons = Template.bind({});
Icons.args = {
    defaultState: FlowEditorState.empty.set("content", FlowContent.fromJsonValue([
        "Information: ", { icon: "information" }, { break: "para" },
        "Success: ", { icon: "success" }, { break: "para" },
        "Warning: ", { icon: "warning" }, { break: "para" },
        "Error: ", { icon: "error" }, { break: "para" },
        "Invalid: ", { icon: "this-icon-is-not-valid" }, { break: "para" },
        // eslint-disable-next-line max-len
        "Custom: ", { icon: "M12,3C7,3 3,7 3,12C3,17 7,21 12,21C17,21 21,17 21,12C21,7 17,3 12,3M12,19C8.1,19 5,15.9 5,12C5,8.1 8.1,5 12,5C15.9,5 19,8.1 19,12C19,15.9 15.9,19 12,19M20.5,20.5C22.7,18.3 24,15.3 24,12C24,8.7 22.7,5.7 20.5,3.5L19.4,4.6C21.3,6.5 22.5,9.1 22.5,12C22.5,14.9 21.3,17.5 19.4,19.4L20.5,20.5M4.6,19.4C2.7,17.5 1.5,14.9 1.5,12C1.5,9.1 2.7,6.5 4.6,4.6L3.5,3.5C1.3,5.7 0,8.7 0,12C0,15.3 1.3,18.3 3.5,20.5L4.6,19.4M9.5,7V17H11.5V13H13.5A2,2 0 0,0 15.5,11V9A2,2 0 0,0 13.5,7H9.5M11.5,9H13.5V11H11.5V9Z" }, { break: "para" },
    ])),
};

function button(
    content: Array<JsonValue>, 
    scriptOrOptions: string | { script?: string, variant?: BoxVariant, color?: FlowColor} = ""
): JsonObject {
    const script = typeof scriptOrOptions === "string" ? scriptOrOptions : scriptOrOptions.script ?? "";
    const variant = typeof scriptOrOptions === "string" ? "outlined" : scriptOrOptions.variant ?? "outlined";
    const color = typeof scriptOrOptions === "string" ? "default" : scriptOrOptions.color ?? "default";
    return {
        box: content,
        style: {
            interaction: { script },
            variant,
            color,
        }
    };
}
