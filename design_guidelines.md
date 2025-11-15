# RFID Wardrobe Organizer - Design Guidelines

## Design Approach
**Selected Approach:** Design System with Visual Enhancement
**Primary Reference:** Material Design meets Pinterest-style visual grids
**Rationale:** Utility-first application requiring efficient wardrobe management with strong visual presentation of clothing items

## Core Design Principles
1. **Mobile-First Excellence** - Optimized for phone scanning and quick interactions
2. **Visual Hierarchy** - Clothing images take center stage with supporting metadata
3. **Scan-Optimized** - Streamlined scanning flow with instant visual feedback
4. **Grid-Based Organization** - Pinterest-style masonry layouts for wardrobe browsing

## Typography System
- **Primary Font:** Inter (Google Fonts) - clean, highly legible for data and labels
- **Display Font:** Inter (weights 600-700) for headers
- **Body Text:** Inter (weight 400) at 16px base
- **Hierarchy:**
  - Page Headers: text-3xl font-bold
  - Section Titles: text-xl font-semibold
  - Card Titles: text-base font-medium
  - Metadata/Labels: text-sm font-normal
  - Micro-text: text-xs for timestamps/counts

## Layout System
**Spacing Units:** Tailwind 3, 4, 6, 8, 12, 16 (p-3, m-4, gap-6, etc.)
- **Container:** max-w-7xl mx-auto px-4
- **Cards:** p-4 rounded-lg with gap-3 for internal spacing
- **Sections:** py-8 md:py-12 for vertical rhythm
- **Grid Gaps:** gap-4 for clothing grids, gap-6 for major sections

## Component Library

### Navigation
- Bottom tab bar (mobile) with 4 primary sections: Scanner, Wardrobe, Outfits, Profile
- Fixed position (fixed bottom-0) with h-16
- Icons with labels (text-xs below icon)

### Scanner Interface
- Full-screen camera view with centered scanning target overlay
- Floating "Scan Tag" button (bottom center) with backdrop-blur-md
- Success animation: Quick checkmark fade with haptic feedback indication
- Recently scanned items carousel at bottom (horizontal scroll)

### Wardrobe Grid
- Masonry-style grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Clothing cards with 3:4 aspect ratio images
- Hover overlay showing quick actions (Edit, Remove, Last Worn)
- Category filter chips (horizontal scroll) at top
- Search bar: h-12 rounded-full with leading search icon

### Clothing Detail Cards
- Full-width image header (aspect-video)
- Content section: p-6 with organized metadata blocks
- Information rows: flex justify-between with label/value pairs
- Tag chip: inline-flex items-center px-3 py-1 rounded-full text-xs
- Actions: Fixed bottom bar with primary/secondary buttons

### Outfit Randomizer
- Large preview area showing 3-4 clothing items in styled arrangement
- Items displayed in natural wearing order (top to bottom)
- Each item: clickable card with rounded-lg and subtle shadow
- "Generate New" button: Large, prominent (h-14 w-full md:w-auto)
- Save/Share actions: Secondary buttons below preview
- Filters panel: Collapsible section with occasion/season toggles

### Database/Inventory View
- Stats dashboard: 4-column grid showing total items, categories, recent additions, most worn
- Each stat card: p-4 text-center with large number (text-4xl) and label (text-sm)
- List view option: Alternating rows with image thumbnail, name, and metadata
- Sort controls: Dropdown or toggle buttons (Last Added, Most Worn, Category)

### Forms (Add/Edit Clothing)
- Stacked layout with clear field labels
- Image upload: Large drop zone (h-48) with dashed border
- Input fields: h-12 with rounded-md borders
- Select dropdowns: Custom styled with chevron icons
- Submit button: w-full h-12 at bottom

### Empty States
- Centered content with icon (text-6xl), heading (text-xl), description (text-sm), and CTA button
- "No clothes scanned yet" for empty wardrobe
- "Add items to generate outfits" for outfit randomizer

## Icons
**Library:** Heroicons via CDN (outline for navigation, solid for actions)
- Scanner: Camera icon
- Wardrobe: Square stack icon
- Outfits: Sparkles icon
- Profile: User icon
- Actions: Plus, pencil, trash, share, heart, clock

## Images
**Usage:** Essential for clothing display
- **Wardrobe Grid:** User-uploaded photos of each clothing item (square crop recommended)
- **Outfit Preview:** Composite view showing selected items
- **Empty States:** Decorative illustrations for onboarding/empty states
- **Placeholder:** Use clothing item type icon when no photo available

**No Hero Section** - App opens directly to functional scanner or wardrobe view

## Animations
**Minimal and Purposeful:**
- Scan success: Quick scale + checkmark fade (duration-200)
- Card hover: Subtle lift with shadow (transition-transform duration-150)
- Page transitions: Slide animations between main sections
- Loading states: Simple spinner for data fetching
- NO complex scroll animations or decorative motion

## Responsive Behavior
- **Mobile (base):** Single column, bottom navigation, full-width cards
- **Tablet (md:):** 2-3 column grids, side navigation option
- **Desktop (lg:):** 4-column grids, persistent sidebar navigation, multi-panel views

## Accessibility
- Touch targets minimum h-12 w-12
- Focus rings on all interactive elements (ring-2 ring-offset-2)
- Descriptive labels for all icons
- Color-independent information (don't rely on color alone)
- Semantic HTML structure