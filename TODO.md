SCRIBING TODO
=============
- Selecting backward (SHIFT+LeftArrow) over nesting node should select that node
- Selecting forward (SHIFT+RightArrow) over nesting node should select that node
- Moving down from inside nesting node does not place caret properly
- Caret is not visible when placed just before/after button
- Caret is lost when moving right at end of content
- Implement TODO-methods in FlowEditCommands
- Insert ghost span to reflect caret style (for example exiting a super-baseline)
- Flow style JSS is duplicated for tool buttons
- Add refresh to dynamic text (auto re-evaluate on an interval)
- Escape to close menu, but not toolbox
- Scripthost: Observe instance vars
- Scribing: Specify script instance in Interaction and DynamicTextExpr
- ScriptEditor: Improve error handling (do not report unexpected tokens that doesn't exist. handle empty expression better?)
- List indent shall depend on paragraph alignment AND reading direction
- Tool: Set list counter
- Tool: Set button action
- Tool: Set dynamic text expression
- Tool: Set reading direction
- Tool: Set line height
- Tool: Set font size
- Tool: Set font family
- Tool: Insert button
- Tool: Toggle full width
- New Ops: WrapButton UnwrapButton
- New interaction: Open Topic
- Omit empty style from dynamic text node data
- Toolbox over interaction point (link/button) makes hover UX crappy
- Cannot toggle toolbox with ctr+period after escaping it
- Text style for disabling spell checker (usage example: math/code)
- FlowBox and BoxStyle -- can/should replace FlowButton? One style could be "condition expression"?
- FlowTheme vs EditorTheme
- FlowTypography (default is SYSTEM_FONT)
- Special para theme for "inside button"? Or at least fix margin or first/last/single para
- Maybe an icon in ScriptEditor/OpenUrlEditor to distinguish between what the input will do?
- Formatting paragraph break with zero opacity is not generally a good idea
- CTRL+PERIOD shall open contextual toolbar with keyboard navigation
- ScriptEditor + OpenUrlEditor must notify on size change and trigger popper update (useContext for this. must apply to both tool menu and tool tip)
- Can baseline offset be applied without affecting height of line box?

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
- MUI lib

SCRIBING COMPONENTS
===================
- Conditional Flow
- FlowBox
- AlertBox
- QuoteBox
- Details/Summary
- Image
- Table
- ForEach templating


SCRIBING FEATURES
=================
- Toolbar
- Spellchecker
- FlowEditor classes prop
- Small caps in text style
- Named para/text styles
- Client/server/proto
