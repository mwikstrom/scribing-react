CARET NAVIGATION
================
- Cannot move into empty paragraph

SCRIBING TODO
=============
- Prevent deletion of last pilcrow (or fix so that it doesn't place caret incorrectly)
- Deleting backward from trailing paragraph can place caret after pilcrow
- Cannot unformat italic from quote box
- Insert ghost span to reflect caret style (for example exiting a super-baseline)
- New Ops: Wrap + Unwrap
- Tool: Insert box
- Improve alert icon positioning (line-height)
- Text style for disabling spell checker (usage example: math/code)
- Toolbox over interaction point (link/button) makes hover UX crappy
- FlowImage
- Tool: Set list counter
- Tool: Set line height
- Tool: Set font size
- Tool: Set font family
- Client/server/proto

LOWER PRIO
==========
- New interaction: Open Topic
- FlowTable
- Escape to close menu, but not toolbox
- Double press CTRL + period shall select entire innermost flow box (press again to select next outer box)
- Show selection outline when non-caret selection is confined within a flow box
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
