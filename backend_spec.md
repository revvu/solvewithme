# Backend Design Spec

## Overview

Backend manages the tutoring logic, recursion system, and interaction with **ChatGPT 5.1**, which performs:

- Problem solving (hidden)
- Insight detection
- Subproblem generation
- Student understanding inference
- Bridging back to parent problems

Backend stays lightweight; ChatGPT 5.1 handles the intelligence.

---

## Core Responsibilities

### 1. Problem Ingestion

Input: problem screenshot.

Steps:

1. Store raw image.
2. Call ChatGPT 5.1:
   - Solve the problem fully.
   - Return a complete solution _not shown to user_.
3. Create root `ProblemNode`.

---

## 2. Conceptual Data Models

### ProblemNode

ProblemNode {
id: string
parent_id: string | null
problem_content: {
text?: string
image_url?: string
}
hidden_solution_text: string
hidden_answer?: string
generated_by: "user_upload" | "llm_subproblem"
target_insight?: string
status: "active" | "solved" | "aborted"
}

### Attempt

Attempt {
problem_node_id: string
user_work_images: [url]
user_text?: string
timestamp: ISODate
}

---

## 3. “I’m Stuck” Endpoint

### Inputs

- `problem_node_id`
- Latest user work images + text (optional)

### ChatGPT 5.1 Responsibilities

Given:

- Problem content
- Hidden solution
- Student work

The model must:

1. Determine what the student already understands.
2. Identify the missing conceptual insight.
3. Generate a simpler subproblem teaching that insight.
4. Produce:
   - A summary of understanding
   - Explanation of the stuck point
   - The new subproblem
   - Tutor messages
5. Produce and store a hidden solution to that subproblem.

### Backend Response

{
student_summary,
missing_insight,
subproblem_text,
tutor_message_intro,
tutor_message_subproblem
}
Backend then creates a new `ProblemNode` as a child.

---

## 4. “Check My Thinking” Endpoint

ChatGPT 5.1 provides conceptual nudges without generating a subproblem.

No structural changes.

---

## 5. Subproblem Completion Endpoint

Inputs:

- Subproblem ID
- User’s subproblem attempt

ChatGPT 5.1 receives:

- Original problem
- Student’s original attempt
- Subproblem text + hidden subproblem solution
- Student’s subproblem work

Tasks:

1. Decide whether student solved the subproblem.
2. If solved, craft a clear bridging message linking the insight to the parent problem.

Output:

- Tutor message for the frontend.

---

## 6. Solution Reveal Endpoint

Returns stored hidden solution/answer.

---

## Backend Philosophy

- Store minimal structure.
- Defer reasoning and pedagogy to ChatGPT 5.1.
- Allow flexibility for implementers to choose infra details.
- Keep recursion clear and simple.

---

End of backend spec.
