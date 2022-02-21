import { useMemo } from "react";
import { Script, TextStyle } from "scribing";
import { ScriptValue } from "scripthost-core";
import { useParagraphTheme } from "../ParagraphThemeScope";
import { useScriptVariables } from "../ScriptVariablesScope";

/** @internal */
export interface ScriptEvalProps {
    vars: Record<string, ScriptValue>;
    context: ScriptEvalContext;
}

/** @internal */
export interface ScriptEvalContext {
    lang?: string;
}

/** @internal */
export interface ScriptEvalScope {
    script?: Script | null;
    textStyle?: TextStyle;
}

/** @internal */
export function useScriptEvalProps(scope: ScriptEvalScope): ScriptEvalProps {
    const { script, textStyle } = scope;
    const context = useScriptEvalContext(textStyle);
    const outerVars = useScriptVariables();
    const messages = script?.messages || null;
    const vars = useMemo(() => messages ? ({
        ...outerVars,
        ...Object.fromEntries(messages.entries()),
    }) : outerVars || EMPTY_VARS, [outerVars, messages]);
    return useMemo<ScriptEvalProps>(() => ({vars, context}), [vars, context]);
}

function useScriptEvalContext(textStyle?: TextStyle): ScriptEvalContext {
    const paraTheme = useParagraphTheme();
    return useMemo<ScriptEvalContext>(() => {
        let lang: string | undefined;
        if (textStyle) {
            lang = textStyle.lang;
        }
        if (lang === undefined && paraTheme) {
            lang = paraTheme.getAmbientTextStyle().lang;
        }
        return { lang };
    }, [textStyle, paraTheme]);
}

const EMPTY_VARS: Record<string, ScriptValue> = Object.freeze({});
