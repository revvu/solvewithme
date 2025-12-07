# Frontend / UI–UX Design Spec

## Overview

This document defines the user interface and experience for the math-tutoring app.  
The layout is optimized for clarity, focus, and seamless interaction with the tutor backend powered by **ChatGPT 5.1**.

Core design idea:  
**Problem at the top, workspace underneath, expandable tutor chat on the right.**

---

## Screen Structure

### 1. Home Screen

- “Upload Problem Screenshot”
- Recent problems
- Basic settings (pen thickness, color theme)

---

## 2. Problem Workspace (Main Screen)

### Layout

+-------------------------------------------------------+
| Problem Statement (Top) |
| (Image OR cleaned-up text rendered as LaTeX) |
+-------------------------------------------------------+
| Workspace Area (Bottom) |
| - Handwriting canvas |
| - Pen / eraser / highlighter |
| - Undo / redo |
| - Upload additional photos of handwritten work |
| - Optional text notes |
+-------------------------------------------------------+
| Expandable Right-Side Chat Panel → |
| (Tutor messages powered by ChatGPT 5.1) |
+-------------------------------------------------------+

---

## Problem Display (Top)

- Always visible when solving or in a subproblem.
- Breadcrumb navigation when recursion occurs:
  - `Original → Subproblem 1 → Subproblem 2`
- Active problem highlighted.

---

## Workspace (Bottom)

- Smooth draw canvas (Apple Pencil friendly).
- Supports:
  - Undo, redo
  - Pen color options
  - Uploading photos
  - Optional typed notes box

---

## Chat Panel (Right)

- Slides open/closed.
- Contains:
  - Tutor messages
  - Insight explanations
  - Subproblem introductions
  - Bridges when returning to parent problems

The chat is _auxiliary_ — the workspace remains the center.

---

## Controls (Nearby the workspace)

- **I’m Stuck** → sends all current work, triggers insight analysis & subproblem generation.
- **Check My Thinking** → soft, non-revealing feedback.
- **Reveal Solution** → confirmation modal → displays hidden solution.
- **Switch to Parent Problem** → visible only in subproblems.
- **Submit Subproblem Solution** → signals "I think I solved this."

---

## Subproblem UX Flow

1. User taps **I’m Stuck**.
2. ChatGPT 5.1 analyzes:
   - Student’s work
   - Hidden full solution
3. Chat panel expands with:
   - What the student understood
   - What insight they missed
   - A newly generated subproblem
4. The top panel updates to show subproblem.
5. When the student completes that, “Done” brings them back to the parent.

---

## Frontend ↔ Backend Data Exchange

Frontend sends:

- Problem screenshot
- Canvas snapshots (PNG)
- Uploaded images
- Typed notes
- Events: stuck, check, solved, reveal, navigation

Frontend receives:

- Tutor messages
- Subproblem statements
- Bridges back to parent problems
- Full solution when requested

---

End of UI/UX spec.
