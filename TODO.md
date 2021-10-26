SCRIBING TODO
=============
- Appending text to trailing paragraph causes caret to disappear
- Don't show empty trailing para in flow-box?!
- Special para theme for "inside box"? Or at least fix margin or first/last/single para
- Formatting paragraph break with zero opacity is not generally a good idea
- Paragraph break mark after block level flow box shall be displayed after the block -- not take up a separate line
- Escape to close menu, but not toolbox
- Cannot unformat italic from quote box
- New Ops: Wrap + Unwrap
- Tool: Insert box
- Improve alert icon positioning (line-height)
- Text style for disabling spell checker (usage example: math/code)
- Toolbox over interaction point (link/button) makes hover UX crappy
- Cannot toggle toolbox with ctr+period after escaping it
- Insert ghost span to reflect caret style (for example exiting a super-baseline)
- Tool: Set list counter
- Tool: Set line height
- Tool: Set font size
- Tool: Set font family
- New interaction: Open Topic
- FlowTheme vs EditorTheme
- FlowTypography (default is SYSTEM_FONT)

LOWER PRIO
==========
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

SCRIBING COMPONENTS
===================
- Image
- Table


SCRIBING FEATURES
=================
- Spellchecker
- FlowEditor classes prop
- Small caps in text style
- Named para/text styles
- Client/server/proto
