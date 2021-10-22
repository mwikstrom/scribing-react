SCRIBING TODO
=============
- Don't show empty trailing para in flow-box?!
- Cannot edit after trailing dynamic text inside flow box template
- Caret position is broken when editing inside flow box template
- Special para theme for "inside box"? Or at least fix margin or first/last/single para
- Formatting paragraph break with zero opacity is not generally a good idea
- Prevent dynamic text/boxes from flickering when editing next to them (cache evaluation?!)
- Clicking on tool button causes editor to loose focus (repro: select caret, click on bold...)
- Escape to close menu, but not toolbox
- Cannot unformat italic from quote box
- Hide toolbox while typing
- Show selection outline when non-caret selection is confined within a flow box
- New Ops: Wrap + Unwrap
- Tool: Insert box
- Tool: Set box variant
- Tool: Toggle inline box
- List indent shall depend on paragraph alignment AND reading direction
- Text style for disabling spell checker (usage example: math/code)
- Toolbox over interaction point (link/button) makes hover UX crappy
- Cannot toggle toolbox with ctr+period after escaping it
- Insert ghost span to reflect caret style (for example exiting a super-baseline)
- Moving down from inside nesting node does not place caret properly
- Can baseline offset be applied without affecting height of line box?
- Tool: Set list counter
- Tool: Set reading direction
- Tool: Set line height
- Tool: Set font size
- Tool: Set font family
- New interaction: Open Topic
- FlowTheme vs EditorTheme
- FlowTypography (default is SYSTEM_FONT)
- CTRL+PERIOD shall open contextual toolbar with keyboard navigation
- ScriptEditor + OpenUrlEditor must notify on size change and trigger popper update (useContext for this. must apply to both tool menu and tool tip)
- ScriptEditor: Improve error handling (do not report unexpected tokens that doesn't exist. handle empty expression better?)
- Maybe an icon in ScriptEditor/OpenUrlEditor to distinguish between what the input will do?

LOWER PRIO
==========
- Hide toolbox arrow when selection includes para break
- MultiFlowSelection
- Paratype: use actual name instead of "freezing"
- React jest snapshots for view comps
- Review react exports
- Use FlowEditorCommands in input handlers and key handlers
- Unify interaction code in FlowButtonView and LinkView
- @validating should verify new.target in ctor
- XML name + attrs on flow box
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
