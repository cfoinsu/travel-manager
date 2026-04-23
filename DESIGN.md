# Family Trip Command Center

## Product Frame
- What this is: A local-first planning and operations workspace for one family trip.
- Primary goal: Keep the purpose of the trip visible while making roster, schedule, stay, and budget updates easy to edit.
- Product tone: Organized, warm, practical, and calm.
- Not this: A military situation room, defense dashboard, or dense command-and-control simulation UI.

## Core UX Principles
- Show the trip purpose first: trip title, dates, and basecamp should be easy to recognize in the header.
- Keep editing close to the data: users should be able to change the trip profile, family counts, and plan items without leaving the current page.
- Reduce visual stress: fewer alarm-like accents, fewer competing panels, more whitespace between editing groups.
- Favor local clarity over cinematic drama: this is a family planner, so the interface should feel trustworthy and tidy rather than intense.
- Preserve context: edits should autosave locally and survive refresh without hidden reset behavior.

## Information Architecture
1. Trip Profile
   Title, trip dates, command/header name, overall note.
2. Family Roster
   Family name, origin, arrival day, ETA, adults, children, vehicle, responsibility, readiness.
3. Daily Plan
   Timeline blocks, route links, activity additions, meal anchors.
4. Stay
   Basecamp details, access notes, check-in/out, logistics.
5. Expenses
   Shared spend, payer, allocation model, settlement state.

## Primary Editing Flows

### 1. Edit Trip Profile
- Fields: `title`, `subtitle`, `commandName`
- Behavior: Changes update the visible header and save to local storage immediately.
- Placement: Top section of the Families page as the main setup area.

### 2. Edit Family Roster
- Fields: `title`, `shortOrigin`, `origin`, `originAddress`, `arrivalDayId`, `eta`, `vehicle`, `vehicleLabel`, `adults`, `children`, `status`, `responsibility`, `routeSummary`
- Behavior: Adults and children immediately recalculate the visible headcount label.
- Placement: Selected-family editor panel on the right side of the Families page.

### 3. Add a Family
- Entry point: `Add family` button in the roster column.
- Default shape: New local custom family with editable counts and arrival info.
- Expected result: The new family appears in the roster, can be selected as the active editing profile, and persists after refresh.

### 4. Add a Travel Plan Item
- Entry point: Existing add-activity flow on the Activities page.
- Minimum required input: title
- Recommended input: day, time window, short description
- Expected result: The new activity becomes selectable, searchable, and persistent.

### 5. Update Participation Counts
- Entry point: Adults and children inputs in the selected-family editor.
- Expected result: The roster summary, family detail panel, and any family headcount labels update immediately and persist after refresh.

## Visual Direction

### Overall Look
- Direction: Structured planning desk, not tactical war room.
- Mood: Calm operations, family logistics, high trust.
- Decoration: Minimal but not severe.

### Typography
- Header labels: Strong, compact uppercase labels for orientation.
- Body copy: Plain, readable UI text without dramatic display styling.
- Data labels: Small uppercase metadata only where it improves scan speed.

### Color
- Base background: Deep navy-charcoal, not pure black.
- Surface contrast: Clear layered panels for edit groups.
- Accent usage: Blue for active/editable state, green for saved/healthy state, amber only for actual warnings.
- Avoid: Constant red alerts, heavy neon glow, excessive "classified" styling.

### Layout
- Left rail: Navigation and global actions.
- Top bar: Trip identity, active family profile, search, autosave state.
- Families page: Two-column editing workspace.
  - Left: Trip profile + family roster + family note.
  - Right: Selected-family editor + task summary.

## Component Rules
- Inputs should use the same visual system as cards: dark surface, clear border, focused blue outline.
- Metric cards should summarize only what helps decisions now: people count, readiness, open tasks.
- Notes stay secondary. Structured fields come before freeform notes.
- Empty states must explain the next action, not just say that nothing exists.

## Data and Persistence Rules
- Storage model: Browser local storage only.
- Editing mode: Private/local mode by default. No public masking while editing.
- Seed data policy: Seeded items can provide defaults, but must not overwrite user edits on reload.
- Custom items: User-added families, activities, expenses, and notes must be preserved.

## Success Criteria
- A user can rename the trip and see the header update immediately.
- A user can change a family from `2 adults / 1 child` to a different count and still see it after refresh.
- A user can add a new family and keep it after refresh.
- A user can add a new activity plan and reopen it later.
- The Families page feels like a clear setup workspace, not just a status wall.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-21 | Reframed the product from Palantir-style dashboard to Family Trip Command Center | The original visual metaphor hid the product purpose behind overly intense operational styling. |
| 2026-04-21 | Made trip profile and family roster direct-edit surfaces | The product needs to support real planning changes, not read-only observation. |
| 2026-04-21 | Defined local-first persistence as a design requirement | The app currently works as a single-browser planner, so surviving refresh is part of core UX quality. |
