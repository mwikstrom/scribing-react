SCRIBING TODO
=============
- Paragraph alignment is not applied/discovered as expected
- Flow style JSS is duplicated for tool buttons
- Escape to close menu, but not toolbox
- Expanded nested selection is not synced. Perhaps we should display fully selected in another way?
- Tool: Set list variant
- Tool: Set list counter
- Tool: Set list marker
- Tool: Set list level
- Tool: Set button action
- Tool: Set link action
- Tool: Set dynamic text expression
- Tool: Set reading direction
- Tool: Set line height
- Tool: Set font size
- Tool: Set font family
- Tool: Insert button
- New interaction: Open Topic
- Toolbox over interaction point (link/button) makes hover UX crappy
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
