/** @public */
export type ScriptEnvironment = Readonly<Record<string | symbol, unknown>>;

/** @public */
export const EMPTY_SCRIPT_ENVIRONMENT: ScriptEnvironment = Object.freeze({});