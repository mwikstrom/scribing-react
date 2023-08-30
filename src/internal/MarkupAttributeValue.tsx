import React, {  useMemo, useState, useEffect, CSSProperties } from "react";
import { FlowColor, OpenUrl, Script } from "scribing";
import { useAttributeFormatter } from "./AttributeFormatterScope";
import { useInteraction } from "./hooks/use-interaction";
import { ScriptEvalScope } from "./hooks/use-script-eval-props";
import { FormatMarkupAttributeEvent } from "../FormatMarkupAttributeEvent";
import { useScribingComponents } from "../ScribingComponents";
import { useFlowPalette } from "../FlowPaletteScope";
import { useMarkupStyles } from "./MarkupStyles";

export interface MarkupAttributeValueProps { 
    tag: string; 
    name: string; 
    value: string | Script;
    evalScope: ScriptEvalScope;
}

export const MarkupAttributeValue = (props: MarkupAttributeValueProps): JSX.Element => {
    const { tag, name: key, value: raw, evalScope } = props;
    const handler = useAttributeFormatter();
    const eventArgs = [tag, key, raw] as const;
    const event = useMemo(() => new FormatMarkupAttributeEvent(...eventArgs), eventArgs);
    const [
        { pending, value, url, color},
        setState,
    ] = useState(() => getAttributeValueState(event));
    const classes = useMarkupStyles();
    const formatted = useMemo(() => typeof value === "string" ? value.replace(/\s+/, " ") : "…", [value]);
    const wrapInQuotes = useMemo(() => (
        !url &&
        color === "default" &&
        /[ "]/.test(formatted)
    ), [url, color, formatted]);
    const quote = wrapInQuotes ? <span className={classes.syntax}>"</span> : null;
    const { Tooltip } = useScribingComponents();
    const palette = useFlowPalette();
    const interaction = useMemo(() => url ? new OpenUrl({ url }) : null, [url]);
    const [elem, setElem] = useState<HTMLElement | null>(null);
    const { clickable, target, href, message } = useInteraction(interaction, elem, evalScope);
    const style = useMemo<CSSProperties>(() => ({
        color: palette[color === "default" ? "text" : color],
        textDecoration: url ? "underline" : "none",
        cursor: clickable ? "pointer" : "default",
    }), [color, url, palette, clickable]);

    useEffect(() => {
        handler(event);
        setState(getAttributeValueState(event));
    }, [event, handler]);

    useEffect(() => {
        if (pending) {
            let active = true;
            event._complete().then(
                () => active && setState(getAttributeValueState(event)),
                () => active && setState({ pending: false, value: raw, url: "", color: "error" }),
            );
            return () => { active = false; };
        }
    }, [pending, event]);

    return (
        <>
            {quote}
            <Tooltip title={message}>
                <a
                    ref={setElem}
                    target={target}
                    href={href || undefined}
                    style={style}
                    children={formatted}
                    onClick={e => e.preventDefault()}
                />
            </Tooltip>
            {quote}
        </>
    );
};

interface MarkupAttributeValueState {
    pending: boolean;
    value: string | Script;
    url: string;
    color: FlowColor;
}

const getAttributeValueState = (event: FormatMarkupAttributeEvent): MarkupAttributeValueState => {
    const { pending, value, url, color } = event;
    return { pending, value, url, color };
};
