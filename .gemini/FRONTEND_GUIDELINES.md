# Frontend Design System (FRONTEND_GUIDELINES.md)

## 1. DESIGN PRINCIPLES
*   **Technical Precision**: Interfaces should feel like professional engineering tools (IDEs, Terminals) rather than generic consumer apps.
*   **Industrial Sharpness**: Use sharp corners (`rounded-none`) and thin borders (`border-[1px]`) to convey stability and professional rigor.
*   **Dark-Mode First**: Optimized for high-focus environments. A deep slate/black base reduces eye strain during long interview sessions.
*   **Blueprint Aesthetic**: Use monospaced accents, grid patterns, and data-heavy layouts to signal "Intelligence" and "System Transparency."
*   **High Contrast & Visibility**: Ensure text remains legible on hover. Avoid low-contrast gray-on-gray interactions. Use brightness or color shifts instead of opacity fades for active states.

---

## 2. DESIGN TOKENS

### Color Palette (Tailwind-Compatible)
**Base (Deep Industrial)** - The foundation of the UI.
-   `background`: #020617 (Slate-950) - **Primary Canvas**
-   `surface`:    #0f172a (Slate-900) - **Card/Panel Background**
-   `border`:     #1e293b (Slate-800) - **Structural Dividers**
-   `foreground`: #f8fafc (Slate-50)  - **Primary Text**
-   `muted`:      #64748b (Slate-500) - **Secondary Text / Metadata**

**Brand & Accents**
-   `primary`:    #10b981 (Emerald-500) - **Action / Success / AI Active**
    -   *Hover State*: `hover:bg-emerald-400` or `hover:text-emerald-400`
-   `accent`:     #38bdf8 (Sky-400)     - **Info / Focus / Selection**
-   `code`:       #e2e8f0 (Slate-200)   - **Monospace Data**

**Semantic**
-   **Success**: #10b981 (Emerald-500)
-   **Warning**: #f59e0b (Amber-500)
-   **Error**:   #ef4444 (Red-500)

### Typography
-   **Primary Font**: `Inter`, system-ui (For long-form reading).
-   **Technical Mono**: `JetBrains Mono` or `Fira Code`.
    -   **Usage**: Headers, Buttons, Navigation, Labels, Data Values, "System" Status messages.
    -   **Style**: often `uppercase` with `tracking-widest` or `tracking-tighter` for headers.
-   **Scale**:
    -   `text-[10px]` / `text-xs`: Metadata, tags, footer links.
    -   `text-sm` / `text-base`: Body copy, standard buttons.
    -   `text-xl` / `text-2xl`: Section headers, card titles.
    -   `text-4xl` - `text-7xl`: Hero titles.

### Spacing & Borders
-   **Border Radius**:
    -   **GLOBAL DEFAULT**: `rounded-none` (0px).
    -   *Exceptions*: Circular avatars or status indicators (rare).
-   **Borders**:
    -   Standard: `border border-border` (1px solid Slate-800).
    -   Active/Focus: `ring-1 ring-primary` (Emerald-500).

---

## 3. LAYOUT SYSTEM
-   **Blueprint Grid**: Use a background grid pattern on major pages (Landing, Auth, Dashboard Home).
    ```jsx
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 -z-10" />
    ```
-   **Container**: `max-width: 1440px` centered (`container mx-auto px-4`).
-   **Section Spacing**: Generous vertical spacing (`py-24` or `py-32`) to allow the "industrial" layout to breathe.

---

## 4. COMPONENT LIBRARY STYLE

### Buttons (Industrial Style)
-   **Shape**: `rounded-none`.
-   **Font**: `font-mono`, `uppercase`, `tracking-widest`, `font-bold`.
-   **Primary**:
    ```jsx
    className="bg-primary text-slate-950 hover:bg-primary/90"
    ```
-   **Ghost/Nav**:
    ```jsx
    className="text-foreground hover:text-primary transition-colors"
    ```

### Input Fields
-   **Style**: `rounded-none`, `bg-background` (or Slate-950), `border-border`.
-   **Focus**: `focus:ring-1 focus:ring-primary` (No heavily blurred glow).
-   **Labels**: `font-mono`, `uppercase`, `text-xs`, `text-muted-foreground`.

### Cards & Panels
-   **Background**: `bg-background` or `bg-surface`.
-   **Border**: `border border-border`.
-   **Hover Effect**: subtle background shift (`hover:bg-primary/5`) or border highlight.
    -   *Crucial*: Ensure text contrast remains high on hover. `group-hover:text-primary` for titles.

---

## 5. ANIMATION GUIDELINES
-   **Motion**: Use `framer-motion` for "mechanical" entrances.
-   **Text Reveal**: Staggered fade-ins or slide-ups for hero text.
-   **Hover**: fast, precise transitions (`duration-300`, `ease-out`).
-   **Scroll**: Smooth scrolling enabled globally (`scroll-behavior: smooth`).

---

## 6. REFERENCE IMPLEMENTATION
For the definitive look and feel, refer to:
-   **Hero Component**: `frontend/src/components/ui/intervyou-hero.jsx`
-   **Auth Layout**: `frontend/src/components/ui/AuthLayout.jsx`

*Any new UI element must align with the visual language established in these files.*
