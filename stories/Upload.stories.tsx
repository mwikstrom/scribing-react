import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { FlowEditor, FlowEditorProps } from "../src/FlowEditor";
import { FlowContent } from "scribing";
import { FlowEditorState } from "../src/FlowEditorState";
import { StoreAssetEvent } from "../src/StoreAssetEvent";

export default {
    title: "Upload",
    component: FlowEditor,
} as ComponentMeta<typeof FlowEditor>;

const defaultState = FlowEditorState.empty.merge({
    content: FlowContent.fromJsonValue([
        "Insert an image or video below to test uploading:",
        { break: "para" },
        { break: "para" },
    ]),
    formattingMarks: true,
});

const Template: ComponentStory<typeof FlowEditor> = args => {
    return (
        <FlowEditor
            defaultState={defaultState}
            {...args}
        />
    );
};

const story = (props: FlowEditorProps = {}) => {
    const bound = Template.bind(props);
    bound.args = props;
    return bound;
};

export const Default = story();

export const AbandonedImage = story({
    defaultState: FlowEditorState.empty.merge({
        content: FlowContent.fromJsonValue([
            "There should be an abandoned image upload here:",
            { break: "para" },
            {
                image: {
                    width: 300,
                    height: 225,
                    url: "",
                    upload: "HdfZqQufJkdYnDocWLEfH",
                    // eslint-disable-next-line max-len
                    placeholder: "/9j/4AAQSkZJRgABAQEASABIAAD/4gIcSUNDX1BST0ZJTEUAAQEAAAIMbGNtcwIQAABtbnRyUkdCIFhZWiAH3AABABkAAwApADlhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAAF5jcHJ0AAABXAAAAAt3dHB0AAABaAAAABRia3B0AAABfAAAABRyWFlaAAABkAAAABRnWFlaAAABpAAAABRiWFlaAAABuAAAABRyVFJDAAABzAAAAEBnVFJDAAABzAAAAEBiVFJDAAABzAAAAEBkZXNjAAAAAAAAAANjMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0ZXh0AAAAAElYAABYWVogAAAAAAAA9tYAAQAAAADTLVhZWiAAAAAAAAADFgAAAzMAAAKkWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPY3VydgAAAAAAAAAaAAAAywHJA2MFkghrC/YQPxVRGzQh8SmQMhg7kkYFUXdd7WtwegWJsZp8rGm/fdPD6TD////bAIQAAgMDAwQDBAUFBAYGBgYGCAgHBwgIDQkKCQoJDRMMDgwMDgwTERQRDxEUER4YFRUYHiMdHB0jKiUlKjUyNUVFXAECAwMDBAMEBQUEBgYGBgYICAcHCAgNCQoJCgkNEwwODAwODBMRFBEPERQRHhgVFRgeIx0cHSMqJSUqNTI1RUVc/8AAEQgADAAQAwEiAAIRAQMRAf/EAGQAAQEBAAAAAAAAAAAAAAAAAAgFBxAAAQQCAgMBAAAAAAAAAAAAAQIDBBEABQYHEyFRQQEBAQAAAAAAAAAAAAAAAAAABQYRAAEDAwUAAAAAAAAAAAAAAAEAAxECBAUGEjFRYf/aAAwDAQACEQMRAD8A1fXdrMnWMlQVXjFEg0R9BwqdhdpyjJdQ0seN1GGPivItzEjS2mZa0pDa01f5dZR5dsFTI2rZWwyhKooJKE0SQCbv76wRrD2tDo5I6JUK9qC+fZgV7CImB7C//9k="
                }
            },
            { break: "para" },
        ]),
        formattingMarks: true,
    })
});

export const AbandonedVideo = story({
    defaultState: FlowEditorState.empty.merge({
        content: FlowContent.fromJsonValue([
            "There should be an abandoned video upload here:",
            { break: "para" },
            {
                video: {
                    width: 300,
                    height: 225,
                    url: "",
                    upload: "HdfZqQufJkdYnDocWLEfH",
                    // eslint-disable-next-line max-len
                    placeholder: "/9j/4AAQSkZJRgABAQEASABIAAD/4gIcSUNDX1BST0ZJTEUAAQEAAAIMbGNtcwIQAABtbnRyUkdCIFhZWiAH3AABABkAAwApADlhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAAF5jcHJ0AAABXAAAAAt3dHB0AAABaAAAABRia3B0AAABfAAAABRyWFlaAAABkAAAABRnWFlaAAABpAAAABRiWFlaAAABuAAAABRyVFJDAAABzAAAAEBnVFJDAAABzAAAAEBiVFJDAAABzAAAAEBkZXNjAAAAAAAAAANjMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0ZXh0AAAAAElYAABYWVogAAAAAAAA9tYAAQAAAADTLVhZWiAAAAAAAAADFgAAAzMAAAKkWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPY3VydgAAAAAAAAAaAAAAywHJA2MFkghrC/YQPxVRGzQh8SmQMhg7kkYFUXdd7WtwegWJsZp8rGm/fdPD6TD////bAIQAAgMDAwQDBAUFBAYGBgYGCAgHBwgIDQkKCQoJDRMMDgwMDgwTERQRDxEUER4YFRUYHiMdHB0jKiUlKjUyNUVFXAECAwMDBAMEBQUEBgYGBgYICAcHCAgNCQoJCgkNEwwODAwODBMRFBEPERQRHhgVFRgeIx0cHSMqJSUqNTI1RUVc/8AAEQgADAAQAwEiAAIRAQMRAf/EAGQAAQEBAAAAAAAAAAAAAAAAAAgFBxAAAQQCAgMBAAAAAAAAAAAAAQIDBBEABQYHEyFRQQEBAQAAAAAAAAAAAAAAAAAABQYRAAEDAwUAAAAAAAAAAAAAAAEAAxECBAUGEjFRYf/aAAwDAQACEQMRAD8A1fXdrMnWMlQVXjFEg0R9BwqdhdpyjJdQ0seN1GGPivItzEjS2mZa0pDa01f5dZR5dsFTI2rZWwyhKooJKE0SQCbv76wRrD2tDo5I6JUK9qC+fZgV7CImB7C//9k="
                }
            },
            { break: "para" },
        ]),
        formattingMarks: true,
    })
});

export const TransientFast = story({
    onStoreAsset: e => e.defer(async () => {
        await run(e, 500);
        e.url = null;
    })
});

export const TransientSlow = story({
    onStoreAsset: e => e.defer(async () => {
        await run(e, 5000);
        e.url = null; 
    })
});

export const FailFast = story({
    onStoreAsset: e => e.defer(async () => {
        await run(e, 500);
        throw new Error("This is an intentional error");
    }),
});

export const FailSlow = story({
    onStoreAsset: e => e.defer(async () => {
        await run(e, 5000);
        throw new Error("This is an intentional error");
    })
});

export const SuccessFast = story({
    onStoreAsset: e => e.defer(async () => {
        await run(e, 500);
        e.url = e.blob && URL.createObjectURL(e.blob);
    }),
});

export const SuccessSlow = story({
    onStoreAsset: e => e.defer(async () => {
        await run(e, 5000);
        e.url = e.blob && URL.createObjectURL(e.blob);
    }),
});

const run = (e: StoreAssetEvent, duration: number): Promise<void> => {
    return new Promise(resolve => {
        const startTime = performance.now();
        const intervalId = setInterval(() => {
            const elapsed = performance.now() - startTime;
            if (elapsed >= duration) {
                clearInterval(intervalId);
                resolve();
            } else {
                const message = `${(elapsed / duration * 100).toFixed(0)}%`;
                e.reportProgress({ message });
            }
        }, Math.min(100, duration));
    });
};
