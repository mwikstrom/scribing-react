import { GenerateId } from "jss";

/** @internal */
export const makeJssId = (component: string): GenerateId => rule => `Scribing${component}-${rule.key}`;

/** @internal */
let dynamicCounter = 0;
export const makeDynamicJssId = (component: string): GenerateId => rule => (
    `${makeJssId(component)(rule)}-dynamic_${++dynamicCounter}`
);
