import { useMemo } from "react";
import { ExposedFunctions, ScriptFunction, ScriptFunctionScope } from "scripthost";
import { ScriptValue } from "scripthost-core";
import { formatMessage } from "./format-message";

/**
 * Default script functions
 * @public
 */
export interface DefaultScriptFunctions extends ExposedFunctions {
    readonly formatMessage: ScriptFunction;
}

/**
 * Gets default functions that should be exposed to script hosts
 * @public
 */
export function useDefaultScriptFunctions(): DefaultScriptFunctions {
    return useMemo<DefaultScriptFunctions>(() => ({ formatMessage: formatMessageScriptFunc }), []);
}

async function formatMessageScriptFunc(this: ScriptFunctionScope, ...args: ScriptValue[]): Promise<ScriptValue> {
    const [messageArg, varsArg] = args;
    const message = typeof messageArg === "string" ? messageArg : String(messageArg);
    const vars = (typeof varsArg === "object" && varsArg !== null) ? {...varsArg} : {};
    const lang = getLangFromScope(this);
    return formatMessage(message, vars, { lang });
}

const getLangFromScope = (scope: ScriptFunctionScope): string | undefined => {
    const { context } = scope;
    if (isObjectWithProp(context, "lang")) {
        const { lang } = context;
        if (typeof lang === "string") {
            return lang;
        }
    }
};

function isObjectWithProp<K extends string>(thing: unknown, prop: K): thing is Record<K, unknown> {
    return typeof thing === "object" && thing !== null && prop in thing;
}
