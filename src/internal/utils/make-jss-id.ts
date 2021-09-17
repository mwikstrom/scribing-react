import { GenerateId } from "jss";

/** @internal */
export const makeJssId = (component: string): GenerateId => rule => `Scribing-${component}-${rule.key}`;