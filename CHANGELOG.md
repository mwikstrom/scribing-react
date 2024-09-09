## 1.14.0 - 2024-09-09

- Support video in flow content
- Allow supplementary assets in `StoreAssetEvent`
- Allow reporting progress in `StoreAssetEvent`

## 1.13.1 - 2024-03-25

- Add special key handler for SHIFT+LEFT/RIGHT arrow to enable tables and empty boxes to be selected properly

## 1.13.0 - 2024-02-14

- Add overridable `FlowViewSkeleton` component, to be rendered while rendering assets are being loaded

## 1.12.1 - 2024-01-30

- Prevent default link interaction while previous interaction is still in progress

## 1.12.0 - 2024-01-29

- Image upload feedback

## 1.11.4 - 2023-11-18

- Fix: Editing host is null unless editing is enabled

## 1.11.3 - 2023-10-19

- Exit nested flow table selection

## 1.11.2 - 2023-10-19

- Detect (and ignore) nested flow table selection

## 1.11.1 - 2023-09-28

- Don't intercept copy/paste events from break-out scope

## 1.11.0 - 2023-09-21

- Copy/paste plain text

## 1.10.2 - 2023-08-31

- Expose script host when rendering markup tag

## 1.10.1 - 2023-08-31

- Fix missing export

## 1.10.0 - 2023-08-31

- Markup tag replacements

## 1.9.1 - 2023-04-21

- Use `isEmptyFlowContent` from core lib

## 1.9.0 - 2023-04-21

- New feature: Expose `node` in `RenderableMarkup`
- New feature: `<NestedFlowView>`

## 1.8.1 - 2023-04-18

- Upgrade to `scribing` version `1.3.0`

## 1.8.0 - 2023-04-11

- Support attributes in text to markup conversion

## 1.7.2 - 2023-03-16

- Fix: Last table heading row border opacity

## 1.7.1 - 2023-03-16

- Fix: Basic table style + heading rows

## 1.7.0 - 2023-03-14

- New feature: `createImageSource(...)` for existing url (already uploaded)

## 1.6.0 - 2023-03-14

- New feature: Zoom scaled down image

## 1.5.0 - 2023-03-14

- New feature: Conversion from markup text to markup nodes. Triggered by the `>` key.
- Limit flow image resize to min 24 px
- Display image resize props

## 1.4.0 - 2023-03-12

- New feature: `MarkupContext`

## 1.3.1 - 2023-03-10

- New feature: `RenderableMarkup.content` `get`/`set`
- New feature: `RenderableMarkup.render()` now accept the content to be rendered as input

## 1.2.1 - 2022-11-29

- Fix counter increment inside shared list counter scope

## 1.2.0 - 2022-11-29

- New feature: `<SharedListCounterScope>`

## 1.1.4 - 2022-11-28

- Hack: Attempt to fix unresponsive tab when flow content starts with a dynamic text
  and editor has auto focus on.

## 1.1.3 - 2022-11-28

- Fix: React replacement registration for empty markup node in a box

## 1.1.2 - 2022-10-11

- Fix: Use the zero-with-space hack for predefined icons too!

## 1.1.1 - 2022-09-29

- Fix: Avoid freezing editor by adding a zero-width-space before icons

## 1.1.0 - 2022-08-29

- New feature: `<ApplicationErrorRenderScope>`

## 1.0.1 - 2022-08-25

- Fix: Nested markup replacements

## 1.0.0 - 2022-05-04

The first non-preview/development release.
