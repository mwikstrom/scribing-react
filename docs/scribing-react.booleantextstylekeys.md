<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [scribing-react](./scribing-react.md) &gt; [BooleanTextStyleKeys](./scribing-react.booleantextstylekeys.md)

## BooleanTextStyleKeys type


<b>Signature:</b>

```typescript
export declare type BooleanTextStyleKeys = {
    [K in keyof TextStyleProps]-?: boolean extends TextStyleProps[K] ? K : never;
}[keyof TextStyleProps];
```
