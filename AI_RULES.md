# AI Rules and Technical Guidelines

This document outlines the core technologies and specific usage rules for this project. Adhering to these guidelines ensures consistency, maintainability, and alignment with the existing codebase.

## 1. Core Tech Stack

The application is built using the following technologies:

*   **Framework:** React (Functional Components & Hooks)
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS (with custom color palette and gradients)
*   **UI Library:** shadcn/ui (built on Radix UI)
*   **Icons:** `lucide-react`
*   **Data Management:** `@tanstack/react-query` (for asynchronous state management)
*   **Animations:** `framer-motion`
*   **Data Visualization:** `recharts`

## 2. Library Usage Rules

| Feature | Recommended Library | Specific Usage / Notes |
| :--- | :--- | :--- |
| **UI Components** | `shadcn/ui` (and underlying Radix components) | **Must** be used for all standard UI elements (Button, Card, Input, Dialog, etc.). Avoid creating custom components if a suitable shadcn component exists. |
| **Styling** | Tailwind CSS | Use Tailwind classes exclusively for all styling, layout, and responsiveness. Custom CSS should be avoided. |
| **Routing** | `react-router-dom` | Use for all navigation. Keep main route definitions in `src/App.tsx`. Use the custom `NavLink` component (`src/components/NavLink.tsx`) for navigation links. |
| **Data Fetching/State** | `@tanstack/react-query` | Use for managing asynchronous data state, caching, and synchronization (even with mock data). |
| **Animations** | `framer-motion` | Use for complex, intentional UI animations (e.g., sidebar transitions, card entry effects). |
| **Notifications** | `sonner` (Toaster) & `useToast` (shadcn) | Use `sonner` for modern, persistent, or global notifications. Use `useToast` (shadcn) for simple, transient alerts (e.g., form submission success/error). |
| **Icons** | `lucide-react` | Use icons from this library only. |
| **Data Visualization** | `recharts` | Use for all chart and graph components. |
| **Data Persistence** | `src/lib/data-store.ts` | Use the provided mock data functions (`getStudents`, `addFaculty`, etc.) for data operations, simulating a backend API. |

## 3. Code Structure and Conventions

*   **File Organization:** Components go in `src/components/`, pages in `src/pages/`, and utilities/hooks in `src/lib/` or `src/hooks/`.
*   **Responsiveness:** All new components and layouts must be responsive by default, utilizing Tailwind's responsive prefixes (e.g., `md:`, `lg:`).
*   **Simplicity:** Prioritize simple, elegant solutions. Avoid over-engineering complex state management or error handling unless explicitly requested.

## 4. Theme and Color Preservation (STRICT)

*   **DO NOT CHANGE THEME COLORS:** The current color palette, as defined in `tailwind.config.ts` and the global CSS variables, is **FROZEN**.
    *   Do not modify `tailwind.config.ts` colors.
    *   Do not change HSL values in `src/index.css` (or equivalent global CSS).
    *   Do not introduce new color variables that clash with or attempt to replace the existing design system.
*   **Maintain Aesthetic:** Any new UI components must strictly adhere to the existing look and feel. Use the existing `primary`, `secondary`, `accent`, `muted`, and `card` colors.
*   **Gradients and Shadows:** Preserve the existing specific shadow and gradient definitions (e.g., `glow`, `glass`, `mesh-gradient`) found in the tailwind config.
48: 
49: ## 5. Project Rules & Constraints
50: 
51: *   **Port Number:** The website is running on port **3000**.
52: *   **No Preview Constraint:** Do **NOT** preview the website or open the browser unless explicitly asked by the user to "make a preview by opening the browser".
