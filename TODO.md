SCRIBING TODO
=============
- Initial selection does not work anymore
- Editor must regain focus when lost to toolbox and toolbox is closed
- Maybe an icon in ScriptEditor/OpenUrlEditor to distinguish between what the input will do?
- LinkView: prevent editable when clickable (CTRL held)
- ScriptEditor + OpenUrlEditor must notify on size change and trigger popper update
- ScriptEditor + OpenUrlEditor shall have common component
- Must allow selection before/after nested button (perhaps using empty text elements before/after?)
- Flow style JSS is duplicated for tool buttons
- Add refresh to dynamic text (auto re-evaluate on an interval)
- Escape to close menu, but not toolbox
- Expanded nested selection is not synced. Perhaps we should display fully selected in another way?
- Scripthost: Observe instance vars
- Scribing: Specify script instance in Interaction and DynamicTextExpr
- ScriptEditor: Improve error handling (do not report unexpected tokens that doesn't exist. handle empty expression better?)
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
- Insert ghost span to reflect caret style
- Text style for disabling spell checker (usage example: math/code)
- Caret is lost when moving right at end of content
- Cannot insert text before/after block level button
- FlowBox and BoxStyle -- can/should replace FlowButton? One style could be "condition expression"?
- FlowTheme vs EditorTheme
- FlowTypography (default is SYSTEM_FONT)
- Special para theme for "inside button"? Or at least fix margin or first/last/single para
- Formatting paragraph break with zero opacity is not generally a good idea
- Let tooltip manager activate the tip that is currently scrolled into view
- CTRL+PERIOD shall open contextual toolbar with keyboard navigation

LOWER PRIO
==========
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
