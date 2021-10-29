SCRIBING TODO
=============
- Text style for disabling spell checker (usage example: math/code)
- FlowImage
- Support any URL in OpenUrl interaction + add URL resolver callback prop (FlowView + FlowEditor)
- Deleting all when there's a final para break, shall result in an empty document with a para break
- Client/server/proto
- Flow caret causes double click to select word to be broken
- Copy flow content to clipboard
- Pase flow content when available
- Fix pilcrow after full width flow box
- Fix insert content after full width flow box
- Cannot move down using arrow key when caret is placed before/inside inline box surrounded by text
- Double arrow is needed to move out of empty flow box
- Tool: Set list counter
- Tool: Set line height
- Tool: Set font size
- Tool: Set font family

LOWER PRIO
==========
- Italic caret does not work. It needs to be inline with outline so that it doesn't mess with line breaking. But tranform requires inline-block...
- Custom selection style?
- New interaction?: Open Topic
- ALT+ENTER shall open insert menu with keyboard focus
- New Ops: Wrap + Unwrap
- FlowTable
- Escape to close menu, but not toolbox
- Double press CTRL + period shall select entire innermost flow box (press again to select next outer box)
- Hide toolbox arrow when selection includes para break
- Hide toolbox while typing?
- MultiFlowSelection
- Paratype: use actual name instead of "freezing"
- React jest snapshots for view comps
- Review react exports
- Use FlowEditorCommands in input handlers and key handlers
- Unify interaction code in FlowButtonView and LinkView
- @validating should verify new.target in ctor
- XML name + attrs on flow box
- CTRL+PERIOD shall open contextual toolbar with keyboard navigation
- ScriptEditor + OpenUrlEditor must notify on size change and trigger popper update (useContext for this. must apply to both tool menu and tool tip)
- ScriptEditor: Improve error handling (do not report unexpected tokens that doesn't exist. handle empty expression better?)
- Maybe an icon in ScriptEditor/OpenUrlEditor to distinguish between what the input will do?
- MUI lib
- Small caps in text style
- Custom spellchecker
- FlowEditor classes prop
- FlowTheme vs EditorTheme
- FlowTypography (default is SYSTEM_FONT)
- Named para/text styles
