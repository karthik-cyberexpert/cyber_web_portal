# Circulars & Notices Page Analysis
**Component:** `src/pages/admin/Circulars.tsx`

## 1. Page Overview
The "Circulars & Notices" page is the digital notice board system. It allows administrators to broadcast announcements to different segments of the institution (Students, Faculty, or Everyone).

## 2. Key Features

### Categories & Visualization
- **Categories**:
    - **Academic**: Emerald color theme.
    - **Examination**: Purple/Pink theme.
    - **Events**: Blue theme.
    - **Urgent/Administrative**: Red/Amber theme (mapped from `AlertCircle`).
- **Icons**: Dynamic icon selection based on category (`Megaphone` for events, `FileText` for exams, etc.).

### Filtering & Search
- **Search**: Real-time filtering by circular title.
- **Category Filter**: Dropdown to isolate specific types of notices (e.g., show only 'Examination' notices).

### Statistics Headers
Four `Card` based widgets summarize the active notices:
- **Total Active**: Count of all current circulars.
- **High Priority**: Count of circulars flagged as 'High'.
- **Event / Academic**: Counts for specific popular categories.

## 3. Operations
- **Publish Circular**: Opens a modal to draft and send a new notice.
- **Delete**: Remove an outdated circular.
- **Persistence**: Uses `getCirculars` and `saveCirculars` local storage adapter.

## 4. UI/UX Elements
- **List Layout**: Stacked cards with a clear hierarchy (Icon -> Title/Category -> Description -> Meta).
- **Badges**: Extensively used for Category and Audience tagging.
- **Empty State**: Custom dashed border component when no circulars match the criteria.

## 5. Dependencies
- **Components**: `Dialog`, `Select`, `Input`, `Textarea`, `Switch` (imported but unused in this version).
- **Icons**: `Bell`, `Pin`, `Send`, `Megaphone` (lucide-react).
