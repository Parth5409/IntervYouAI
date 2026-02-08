# Frontend Design System (FRONTEND_GUIDELINES.md)

## 1. DESIGN PRINCIPLES
* **High Fidelity**: Interfaces should mimic real-world corporate software to prepare students for professional environments.
* **Focus-Centric**: Minimalist layouts that reduce cognitive load during high-stress mock interviews.
* **Unbiased Accessibility**: Design must exceed WCAG 2.1 AA standards to ensure all students have an equal preparation ground.
* **Feedback Immediacy**: Every user action (especially voice input) must have an instant visual state change.

---

## 2. DESIGN TOKENS

### Color Palette (Tailwind-Compatible)
**Primary (Industrial Slate)** - Used for headers, sidebars, and primary actions.
- `slate-50`:  #f8fafc
- `slate-200`: #e2e8f0
- `slate-500`: #64748b
- `slate-700`: #334155
- `slate-900`: #0f172a (Primary Brand Color)

**Neutral (Concrete)** - Used for backgrounds and borders.
- `gray-50`:  #f9fafb
- `gray-200`: #e5e7eb
- `gray-500`: #6b7280
- `gray-900`: #111827

**Semantic**
- **Success**: #059669 (Emerald 600) - Placement Ready
- **Warning**: #d97706 (Amber 600) - Needs Improvement
- **Error**:   #dc2626 (Red 600) - Critical Fail
- **Info**:    #2563eb (Blue 600) - System Updates

### Typography
- **Primary Sans**: `Inter`, system-ui, sans-serif.
- **Monospace**: `JetBrains Mono`, monospace (for code feedback).
- **Sizes**:
    - `text-xs`: 0.75rem (12px)
    - `text-base`: 1rem (16px) - **Default Body**
    - `text-xl`: 1.25rem (20px) - **H3**
    - `text-4xl`: 2.25rem (36px) - **H1**
- **Weights**: Light (300), Regular (400), Medium (500), Bold (700).

### Spacing & Borders
- **Base Unit**: 4px (`1` in Tailwind = 0.25rem).
- **Border Radius**: 
    - `sm`: 0.125rem | `md`: 0.375rem (Default) | `lg`: 0.5rem | `full`: 9999px.
- **Shadows**:
    - `base`: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
    - `xl`: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)

---

## 3. LAYOUT SYSTEM
- **Container**: `max-width: 1280px` (xl) centered.
- **Breakpoints**:
    - Mobile (`sm`): 640px (Single column)
    - Tablet (`md`): 768px (Sidebar collapses to drawer)
    - Desktop (`lg`): 1024px (Standard)
- **Grid**: 12-column system with `gap-6` (24px) gutters.

---

## 4. COMPONENT LIBRARY

### Buttons
```jsx
// Variants: Primary, Outline, Danger
const Button = ({ variant = 'primary', size = 'md', isLoading, children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-slate-600 hover:bg-slate-100"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-sm",
    md: "px-6 py-3 text-base rounded-md",
    lg: "px-8 py-4 text-lg rounded-lg"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]}`} {...props}>
      {isLoading ? <Spinner className="mr-2" /> : null}
      {children}
    </button>
  );
};
### Input Fields
```javascript
// States: Default, Error, Success
<div className="space-y-1">
  <label className="text-sm font-medium text-slate-700">Email Address</label>
  <input 
    type="email" 
    className="w-full border-gray-300 rounded-md shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm 
               invalid:border-red-500 invalid:text-red-600"
    placeholder="student@university.edu"
  />
  <p className="text-xs text-slate-500">Use your university-issued email.</p>
</div>
```

---

## 5. ACCESSIBILITY GUIDELINES
1. **Contrast**: All text must maintain a 4.5:1 ratio against backgrounds. Use `slate-900` for primary text.
2. **Keyboard**: All interactive elements (Buttons, Inputs, Cards) must show a 2px solid slate outline when focused via Tab.
3. **ARIA Labels**: All icon-only buttons must have `aria-label`.
4. **Touch Targets**: Minimum 44x44px for all clickable areas on mobile.

---

## 6. ANIMATION GUIDELINES
* **Standard Transition**: `duration-200 ease-in-out` for hover states.
* **Modals**: Scale-in with opacity (`scale-95` to `scale-100`).
* **Performance**: Animate only `transform` and `opacity`. Use `will-change-transform` for the Live Waveform.

---

## 7. ICON SYSTEM
* **Library**: Lucide React.
* **Sizing**:
    * **UI Icons**: 16px (stroke: 2)
    * **Feature Icons**: 24px (stroke: 1.5)
* **Color**: Inherit from text color unless semantic (e.g., green checkmark).

---

## 8. STATE INDICATORS

### Loading State (Skeleton)
```javascript
<div className="animate-pulse flex space-x-4">
  <div className="rounded-full bg-slate-200 h-10 w-10"></div>
  <div className="flex-1 space-y-6 py-1">
    <div className="h-2 bg-slate-200 rounded"></div>
    <div className="h-2 bg-slate-200 rounded w-3/4"></div>
  </div>
</div>
```

### Empty State
```javascript
<div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
  <Search className="mx-auto h-12 w-12 text-slate-400" />
  <h3 className="mt-2 text-sm font-medium text-slate-900">No drives found</h3>
  <p className="mt-1 text-sm text-slate-500">Contact your TPO to assign a mock interview.</p>
</div>
```

---

## 9. BROWSER SUPPORT
* **Target**: Last 2 versions of Chrome, Firefox, Edge, and Safari.
* **Polyfills**: Handled via `regenerator-runtime` for Speech Recognition in older browsers.
