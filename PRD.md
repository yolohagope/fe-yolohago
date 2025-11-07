# Planning Guide

A microtask marketplace platform that connects task posters with service providers, displaying available tasks in an engaging, filterable wall format where users can quickly browse and select opportunities.

**Experience Qualities**: 
1. **Trustworthy** - Clear verification badges and payment information build confidence in the platform's reliability and safety
2. **Efficient** - Quick filtering and scanning capabilities allow users to find relevant tasks within seconds
3. **Energetic** - Vibrant Google-inspired colors (blue, red, yellow, green) create an optimistic, opportunity-focused atmosphere

**Complexity Level**: Light Application (multiple features with basic state)
  - The app features task browsing, filtering, and search functionality with persistent state management for filters and potential future user preferences

## Essential Features

### Task Wall Display
- **Functionality**: Displays available microtasks in a responsive grid layout with key information visible at a glance
- **Purpose**: Allows users to quickly scan multiple opportunities and identify tasks matching their interests
- **Trigger**: Loads automatically on app launch
- **Progression**: App loads → Grid renders with mock tasks → User scans cards → Identifies interesting tasks → Clicks for details
- **Success criteria**: All task cards render correctly, grid responds to screen size changes, information is clearly legible

### Search Filter
- **Functionality**: Text input that filters tasks by title or description keywords in real-time
- **Purpose**: Enables users to quickly narrow down tasks by specific keywords or requirements
- **Trigger**: User types in search input field
- **Progression**: User focuses search field → Types keywords → Results filter instantly → Relevant tasks remain visible → Empty state shows if no matches
- **Success criteria**: Filtering happens without delay, results update on each keystroke, clear feedback when no results found

### Category Filter
- **Functionality**: Dropdown selector that filters tasks by predefined categories (Compras, Trámites, Delivery, etc.)
- **Purpose**: Helps users focus on task types that match their skills or preferences
- **Trigger**: User clicks category dropdown and selects option
- **Progression**: User opens dropdown → Views category options → Selects category → Grid updates to show only matching tasks → "All" option resets filter
- **Success criteria**: Dropdown displays all categories, selection updates grid immediately, filter persists until changed

### Task Card
- **Functionality**: Compact, visually appealing card component displaying essential task information
- **Purpose**: Presents key decision-making information (payment, location, deadline, trust indicators) in scannable format
- **Trigger**: Renders automatically for each task in dataset
- **Progression**: Card appears in grid → User scans payment amount → Checks location/deadline → Notes verification badge → Clicks "Ver Detalles" button → (Future: opens detail view)
- **Success criteria**: All information clearly visible, payment amount prominently displayed, verification badge noticeable, button has clear hover state

## Edge Case Handling

- **No Search Results**: Display friendly empty state message encouraging users to adjust filters or check back later
- **Long Task Titles**: Truncate with ellipsis after 2 lines to maintain card height consistency
- **Missing Data**: Show placeholder text or hide optional fields (e.g., location) if not provided
- **Network-less Use**: Mock data ensures app remains functional for demonstration purposes
- **Mobile Touch Targets**: Ensure all interactive elements meet 44x44px minimum touch target size

## Design Direction

The design should feel energetic and trustworthy with Google's signature color palette (blue #4285F4, red #EA4335, yellow #FBBC04, green #34A853), creating an optimistic marketplace atmosphere where opportunities feel accessible and legitimate. The interface should be minimal with clean cards, ample white space, and clear typography that prioritizes scannability over richness.

## Color Selection

**Triadic** (Google's four-color palette adapted as primary action colors with neutral backgrounds)
The color scheme uses Google's iconic brand colors to create visual energy and trust, with each color serving specific UI purposes while maintaining the brand's optimistic, accessible personality.

- **Primary Color**: Google Blue (#4285F4 / oklch(0.623 0.179 252)) - Main brand color representing trust and primary actions, used for "Ver Detalles" buttons and key interactive elements
- **Secondary Colors**: 
  - Google Red (#EA4335 / oklch(0.604 0.204 24)) for urgent/deadline indicators
  - Google Yellow (#FBBC04 / oklch(0.815 0.167 91)) for payment amounts and value highlights
  - Google Green (#34A853 / oklch(0.640 0.155 145)) for verification badges and positive indicators
- **Accent Color**: Google Yellow (#FBBC04) for payment amounts, the most important decision factor for users taking on microtasks
- **Foreground/Background Pairings**:
  - Background (White #FFFFFF): Dark gray text (#202124 / oklch(0.15 0 0)) - Ratio 15.3:1 ✓
  - Card (White #FFFFFF): Dark gray text (#202124) - Ratio 15.3:1 ✓
  - Primary (Blue #4285F4): White text (#FFFFFF) - Ratio 4.7:1 ✓
  - Secondary (Light Gray #F8F9FA): Dark gray text (#202124) - Ratio 14.8:1 ✓
  - Accent (Yellow #FBBC04): Dark text (#202124) - Ratio 8.2:1 ✓
  - Muted (Gray #5F6368): White background - Ratio 7.0:1 ✓

## Font Selection

The typeface should convey clarity and modernity, matching Google's design language with excellent readability for quick task scanning. Use **Inter** (primary) for its exceptional screen legibility and neutral professionalism, creating a clean, accessible interface that prioritizes content over decoration.

- **Typographic Hierarchy**: 
  - H1 (Page Title "Muro de Tareas"): Inter Bold/32px/tight (-0.02em) for strong presence
  - H2 (Task Card Title): Inter Semibold/18px/normal for clear hierarchy within cards
  - Body (Location, deadline): Inter Regular/14px/relaxed (1.5) for comfortable reading
  - Label (Category, filters): Inter Medium/13px/normal for UI controls
  - Accent (Payment amount): Inter Bold/24px/tight for maximum emphasis

## Animations

Animations should be subtle and purposeful, creating a responsive feel without delaying user actions - quick hover states and smooth filtering transitions that confirm interactions without drawing attention to the motion itself.

- **Purposeful Meaning**: Micro-interactions on cards (subtle lift on hover) communicate interactivity and create a tactile, responsive feel that encourages exploration
- **Hierarchy of Movement**: Filter changes (fade/slide) deserve smooth 200ms transitions, while button hovers require instant 100ms feedback for perceived performance

## Component Selection

- **Components**: 
  - Card (Shadcn) for task containers with subtle shadow and clean borders
  - Input (Shadcn) for search field with clear focus states
  - Select (Shadcn) for category dropdown with smooth open/close animation
  - Button (Shadcn) for "Ver Detalles" with primary blue variant
  - Badge (Shadcn) for verification indicator with green success variant
- **Customizations**: 
  - Custom payment display component with yellow accent background and large bold text
  - Category badges with color-coded backgrounds matching task type
  - Grid layout wrapper using Tailwind's responsive grid (1 col mobile → 2 cols tablet → 3 cols desktop)
- **States**: 
  - Buttons: Default blue, hover with slightly darker blue + subtle lift, active with slight scale down, disabled with reduced opacity
  - Inputs: Default with gray border, focus with blue ring and border, filled with maintained focus style
  - Cards: Default flat with light shadow, hover with elevated shadow and subtle translate up (-2px)
- **Icon Selection**: 
  - MapPin (Phosphor) for location - clear geographical indicator
  - Calendar (Phosphor) for deadline - universally recognized time symbol
  - CurrencyCircleDollar (Phosphor) for payment - immediate value recognition
  - CheckCircle (Phosphor) for verification badge - trust and approval
  - MagnifyingGlass (Phosphor) for search - standard search icon
  - Funnel (Phosphor) for filters - clear filtering metaphor
- **Spacing**: 
  - Container padding: px-4 (mobile), px-6 (tablet), px-8 (desktop)
  - Grid gap: gap-4 (mobile), gap-6 (desktop) for breathing room between cards
  - Card internal padding: p-6 for comfortable content spacing
  - Section spacing: space-y-6 between filter area and task grid
- **Mobile**: 
  - Stack filters vertically on mobile with full-width inputs
  - Single column grid for task cards with full horizontal space
  - Larger touch targets (min 44x44px) for all interactive elements
  - Simplified card layout with stacked information instead of side-by-side
