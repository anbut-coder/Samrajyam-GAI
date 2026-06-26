# Samrajyam AI Inbox – Product Backlog & Master Prompt

## Mission
Transform Samrajyam from a working prototype into a production-quality application that can be used every day.
Focus on usability, workflow, stability, and user experience.

## Core Rules
- **No Regeneration**: This is an existing production project. DO NOT regenerate the project.
- **No Architecture Changes**: DO NOT replace the architecture.
- **Backend Stability**: DO NOT modify the backend API, Express server config, Firebase deployment, Gemini integration, or dotenv configuration.
- **Preserve Features**: DO NOT remove existing functionality.
- **Incremental**: Only make incremental improvements.

## Active Sprint: v0.2.1 – Product Stability & Usability Sprint

### Priority 1 – Fix AI Image Capture (Mobile First)
- **Workflow**: User taps "AI Capture" -> File Picker opens -> User selects image -> Preview appears -> Automatically calls `/api/analyze-image` -> Displays loading spinner -> Disables upload controls -> Displays extracted results.
- **Error Handling**: Show a user-friendly retry message if analysis fails. Never leave the user on a dead screen.
- **Performance**: Prevent duplicate uploads and API requests.

### Priorities 2-5 – Manual Entry
- **Tasks**: Title, Description, Priority, Due Date (optional), Category (optional).
- **Notes**: Title, Content.
- **Reminders**: Title, Date, Time.
- **Meetings**: Title, Date, Time, Attendees, Notes.
- **Behaviour**: Save and Cancel buttons for all. Display immediately in the Dashboard after saving.

### Priority 6-7 – Edit & Delete
- Every entity must support editing (Update, Save, Cancel).
- Every entity must support deletion (Ask for confirmation).

### Priority 8 – Dashboard
- **Top Actions**: "New Task", "AI Capture".
- **Sections**: Today’s Tasks, Upcoming Meetings, Recent Notes, Recent Reminders.
- **Empty States**: Display meaningful messages (e.g., "No Tasks Yet", "Create Your First Task").

### Priority 9-10 – Mobile UX & Responsive Design
- **Mobile**: Bottom navigation, Floating Action Button (FAB) that opens a Bottom Sheet (AI Capture, New Task, New Note, New Reminder, New Meeting). Material Design style.
- **Responsive**: Multi-column layout on Desktop, collapsible sidebar on Tablet, single column on Mobile. No horizontal scrolling.

### Priority 11 – Loading & Error States
- Every action must provide feedback (Loading, Success, Failure, Empty State). No blank screens or silent failures.

### Priority 12 – Data Model
- Manual entries and AI entries must use exactly the same data model (e.g., Task Object). No separate implementations.

### Priority 13-14 – User Experience & Design
- **Feel**: Should feel like Google Tasks, Google Keep, Google Lens. Interface should always guide the user.
- **Design**: Maintain the existing Samrajyam Design System (Light, Dark, System themes). Professional appearance. No redesign, only improvements.

## Acceptance Criteria
✓ Capture screenshots using AI
✓ Automatically analyze screenshots on mobile
✓ Manually create Tasks, Notes, Meetings, Reminders
✓ Edit and Delete everything
✓ Use comfortably on Desktop, Tablet, and Android
✓ Receive loading and error feedback for every action
✓ Never encounter a dead-end screen
