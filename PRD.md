# Planning Guide

A printable math practice application designed for tablet pen input that provides adaptive learning experiences across multiple difficulty levels with built-in guidance and feedback.

**Experience Qualities**: 
1. **Playful** - Learning math should feel engaging and rewarding, not intimidating or tedious
2. **Clear** - Visual hierarchy guides students through problems with immediate, constructive feedback
3. **Adaptive** - Seamlessly adjusts to each learner's pace with progressive complexity

**Complexity Level**: Light Application (multiple features with basic state)
  - Manages practice sessions, difficulty levels, problem generation, and printable worksheets while maintaining simple state for progress tracking

## Essential Features

### Difficulty Level Selection
- **Functionality**: Choose between beginner (single-digit), intermediate (double-digit), and advanced (multi-digit with fractions/decimals) math problems
- **Purpose**: Allows learners to practice at their appropriate skill level and progress naturally
- **Trigger**: Initial app load or via settings panel
- **Progression**: Landing screen → Level selector cards → Problem interface loads with appropriate difficulty
- **Success criteria**: Problems generate correctly for each level; visual indication of current level

### Problem Generation by Operation Type
- **Functionality**: Generate random problems for addition, subtraction, multiplication, and division based on selected difficulty
- **Purpose**: Focused practice on specific operation types or mixed practice
- **Trigger**: Operation type selector or "mixed" mode toggle
- **Progression**: Select operation type → Problems generate → Work through set → View results
- **Success criteria**: Random problems are mathematically correct; no repeated problems in same session

### Tablet Pen Input with Real-time Validation
- **Functionality**: Large input areas optimized for stylus/pen input with immediate feedback on correctness
- **Purpose**: Natural writing experience for tablet users with instant validation
- **Trigger**: Tap/pen touch on answer input area
- **Progression**: Focus input → Write answer → Submit/auto-validate → Visual feedback (correct=green, incorrect=red with correct answer shown)
- **Success criteria**: Input areas respond smoothly to pen; validation is accurate; feedback is immediate

### Guided Mode with Step-by-Step Hints
- **Functionality**: Optional hint system that breaks down problem-solving into steps
- **Purpose**: Scaffolded learning for students who need additional support
- **Trigger**: Toggle "Guided Mode" or tap hint button on individual problems
- **Progression**: Enable guided mode → Problem displays with hint button → Tap for step-by-step breakdown → Work through with guidance
- **Success criteria**: Hints are contextually appropriate; don't give away answer immediately; progressive revelation

### Printable Worksheet Generator
- **Functionality**: Generate clean, printer-friendly worksheets with answer keys
- **Purpose**: Allows offline practice and teacher/parent distribution
- **Trigger**: "Print Worksheet" button in toolbar
- **Progression**: Select print mode → Choose problem count (10/20/30) → Preview worksheet → Print or download PDF
- **Success criteria**: Print layout is clean and appropriate for standard paper; answer key generates on separate page

### Progress Tracking Dashboard
- **Functionality**: Simple stats showing problems attempted, accuracy rate, and time spent per session
- **Purpose**: Motivates learners by showing improvement over time
- **Trigger**: Automatic tracking during practice; view via dashboard button
- **Progression**: Complete problems → Stats update in real-time → Access dashboard → View accuracy trends and time metrics
- **Success criteria**: Stats persist across sessions; visualizations are clear and encouraging

## Edge Case Handling

- **Division by Zero**: Problem generator explicitly avoids creating division problems where divisor is zero
- **Negative Results (Beginner)**: Subtraction problems at beginner level ensure larger number comes first to avoid negative answers
- **Decimal Precision**: Advanced division problems round to 2 decimal places with clear indication
- **Empty Input Submission**: Gentle prompt to write an answer before validating rather than marking wrong
- **Rapid Problem Skipping**: Confirmation dialog if user tries to exit session with many unanswered problems
- **Print Without Problems Generated**: Disable print button until at least one problem set is created

## Design Direction

The design should feel educational yet playful—like a modern classroom that encourages experimentation without fear of failure. Think Apple Classroom meets Khan Academy: clean, spacious, with generous tap targets for pen input. The interface should feel calm and focused to minimize cognitive load, with pops of color for feedback and encouragement. Minimal rather than rich interface to keep focus on the math problems themselves.

## Color Selection

Analogous color scheme (blues to greens) to create a calming, focused learning environment with warm accent colors for positive feedback.

- **Primary Color**: Deep Ocean Blue (oklch(0.45 0.15 250)) - Conveys trust, focus, and academic seriousness
- **Secondary Colors**: 
  - Soft Sky Blue (oklch(0.75 0.08 240)) for backgrounds and cards—non-distracting, calm
  - Sage Green (oklch(0.65 0.10 155)) for subtle UI elements and borders
- **Accent Color**: Energetic Coral (oklch(0.70 0.18 35)) for CTAs, success states, and encouraging feedback elements
- **Foreground/Background Pairings**:
  - Background (Soft Cream oklch(0.97 0.01 85)): Dark Ocean Text (oklch(0.25 0.08 250)) - Ratio 11.2:1 ✓
  - Card (Pure White oklch(1 0 0)): Deep Ocean (oklch(0.45 0.15 250)) - Ratio 8.9:1 ✓
  - Primary (Deep Ocean oklch(0.45 0.15 250)): White Text (oklch(1 0 0)) - Ratio 8.9:1 ✓
  - Secondary (Soft Sky oklch(0.75 0.08 240)): Dark Text (oklch(0.25 0.08 250)) - Ratio 5.2:1 ✓
  - Accent (Coral oklch(0.70 0.18 35)): White Text (oklch(1 0 0)) - Ratio 5.1:1 ✓
  - Muted (Light Gray oklch(0.92 0.01 250)): Mid Gray Text (oklch(0.50 0.05 250)) - Ratio 6.8:1 ✓

## Font Selection

Typography should be highly legible with generous spacing for easy reading during practice sessions. A clean geometric sans-serif conveys modern education while maintaining approachability.

**Primary Typeface**: Inter - Clean, highly readable, excellent for both UI and mathematical content

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/32px/tight tracking - Used sparingly for main branding
  - H2 (Section Headers): Inter Semibold/24px/normal tracking - Level names, mode labels
  - H3 (Problem Numbers): Inter Medium/18px/normal tracking - "Problem 1 of 10"
  - Math Problem Display: Inter Bold/48px/wide tracking - The actual math problems themselves, large and clear
  - Answer Input: Inter Regular/36px - Spacious input areas for pen writing
  - Body Text (Hints/Guidance): Inter Regular/16px/1.6 line-height - Comfortable reading
  - Button Labels: Inter Medium/14px/wide tracking - Clear CTAs
  - Stats/Metrics: Inter Semibold/20px with tabular numbers

## Animations

Animations should be purposeful and encouraging—celebrating correct answers without being distracting, guiding attention to the next problem smoothly. The balance leans toward subtle functionality with small moments of delight for positive reinforcement (correct answer celebration).

- **Purposeful Meaning**: Success animations (gentle bounce, confetti burst) reinforce positive learning psychology; smooth transitions between problems maintain flow state
- **Hierarchy of Movement**:
  1. **High Priority**: Answer validation feedback (immediate, under 150ms)
  2. **Medium Priority**: Problem transitions (smooth 300ms slide)
  3. **Low Priority**: Hint reveals (gentle 250ms expand)
  4. **Delight Layer**: Correct answer celebrations (playful 400ms scale + color)

## Component Selection

- **Components**: 
  - `Card` with hover states for difficulty level selection and dashboard stats
  - `Button` (primary, secondary, outline variants) for all actions - large touch targets (min 48px)
  - `Input` with custom styling for large pen-friendly answer areas
  - `Select` for operation type chooser (addition, subtraction, etc.)
  - `Switch` for guided mode toggle
  - `Dialog` for print preview and settings
  - `Progress` bar for session completion tracking
  - `Badge` for difficulty level indicators and stats
  - `Separator` for visual section division
  - `Tooltip` for subtle help hints on controls
  
- **Customizations**: 
  - Extra-large Input variant (72px height, 24px font) for answer entry optimized for tablet pen
  - Custom problem display component with flexible layout for different operation types
  - Print-specific CSS using `@media print` to create clean worksheet layouts
  - Custom celebration animation component using framer-motion for correct answers
  
- **States**: 
  - Buttons: Default (solid primary), Hover (slight lift + color deepen), Active (pressed down feel), Disabled (50% opacity)
  - Inputs: Default (neutral border), Focus (accent color border + subtle glow), Correct (green border + checkmark), Incorrect (red border + shake)
  - Cards: Default (subtle shadow), Hover (elevated shadow), Selected (accent border)
  
- **Icon Selection**: 
  - @phosphor-icons/react: `Plus`, `Minus`, `X` (multiply), `Divide`, `Check`, `X` (wrong), `Lightbulb` (hints), `Printer`, `ChartBar` (stats), `Gear` (settings), `ArrowRight` (next problem)
  
- **Spacing**: 
  - Consistent 4px base unit: Problem areas use `gap-8` (32px), card grids use `gap-6` (24px), buttons use `px-6 py-3`, section padding is `p-8` on desktop, `p-4` on mobile
  
- **Mobile**: 
  - Single column layout on mobile with full-width problem cards
  - Collapsible navigation with bottom sheet for settings
  - Touch-optimized button sizes (min 48px) maintained across breakpoints
  - Print functionality adapts to "Save as PDF" on mobile devices
  - Guided hints move from sidebar to bottom sheet on narrow screens
