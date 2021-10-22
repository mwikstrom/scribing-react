import React, { createContext, FC, ReactNode, useContext } from "react";
import { ScriptValue } from "scripthost-core";

/**
 * @public
 */
export interface ScriptVaraiblesScopeProps {
    variables?: Record<string, ScriptValue>;
    children?: ReactNode;
}

/**
 * @public
 */
export const ScriptVaraiblesScope: FC<ScriptVaraiblesScopeProps> = ({
    variables,
    children,
}) => {
    return (
        <ScriptVariablesContext.Provider
            value={variables}
            children={children}
        />
    );
};

/**
 * @public
 */
export function useScriptVariables(): Record<string, ScriptValue> | undefined {
    return useContext(ScriptVariablesContext);
}

const ScriptVariablesContext = createContext<Record<string, ScriptValue> | undefined>(undefined);
