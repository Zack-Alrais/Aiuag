# AIUAG Website — Comprehensive Design Overhaul Plan

## Current State Summary

### What Exists
- **40+ public pages**, **25+ admin pages**, **100+ API routes**
- Tailwind CSS v4 with CSS-based theme tokens (dark mode via 350+ `!important` overrides)
- Custom UI components: Button, Card, Input, Avatar, Badge, Skeleton, Tabs, Dialog, Pagination
- Bilingual AR/EN with RTL support
- Custom animations: fadeIn, slideIn, countUp, pulse
- Lucide React icons
- No animation library (pure CSS keyframes)
- No carousel library (custom implementation)
- No toast system (uses `alert()` in many places)
- No command palette / search modal (custom search-overlay)

### Critical Design Issues
1. **Dark mode**: 350+ lines of `!important` CSS overrides instead of proper `dark:` variants
2. **Auth pages**: Red accent (#c8102e) vs site gold (#D4A843) — inconsistent
3. **No page transitions**: Pages load statically, no smooth navigation
4. **No scroll animations**: Elements appear instantly, no staggered reveals
5. **No micro-interactions**: Buttons/cards lack hover/tap feedback
6. **No skeleton loading on homepage**: Stats show raw numbers
7. **Header**: No glass morphism, no shrink animation on scroll
8. **Footer newsletter**: Fake — no API call
9. **Cards**: Basic shadows, no depth hierarchy
10. **Forms**: Mix of raw `<input>` and `<Input>` component
11. **No toast notifications**: Uses `alert()` or silent failures
12. **No smooth page transitions**: Full page reloads between routes

---

## Design Overhaul Plan — 12 Phases

### Phase 1: Design System Foundation
**Goal**: Establish a proper design token system and component library

#### 1.1 Tailwind Config (`tailwind.config.ts`)
```ts
// Add proper theme extension instead of CSS overrides
theme: {
  extend: {
    colors: {
      primary: { DEFAULT: '#1A3A6B', light: '#2B5EA7', dark: '#122848', 50: '#EBF0F7' },
      secondary: { DEFAULT: '#D4A843', light: '#E0BC6A', dark: '#B48C27', 50: '#FDF8ED' },
      accent: { DEFAULT: '#2E7D32', light: '#4CAF50', 50: '#E8F5E9' },
      surface: { DEFAULT: '#FFFFFF', secondary: '#F8F9FA', tertiary: '#F1F5F9' },
    },
    borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
    boxShadow: {
      'soft': '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
      'glow': '0 0 20px rgba(26,58,107,0.15)',
      'card': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
      'card-hover': '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    },
    animation: {
      'fade-in-up': 'fadeInUp 0.6s ease-out',
      'slide-in-right': 'slideInRight 0.5s ease-out',
      'scale-in': 'scaleIn 0.3s ease-out',
      'float': 'float 6s ease-in-out infinite',
      'shimmer': 'shimmer 2s infinite',
    },
    keyframes: {
      fadeInUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      slideInRight: { '0%': { opacity: '0', transform: 'translateX(30px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
    },
  },
}
```

#### 1.2 New UI Components to Create
| Component | Purpose | Library |
|-----------|---------|---------|
| `MotionDiv` | Framer Motion wrapper | framer-motion |
| `Toast` | Notification system | sonner |
| `AnimatedCard` | Card with hover/tap animations | framer-motion |
| `GlassCard` | Glassmorphism card | tailwind |
| `GradientText` | Gradient text utility | tailwind |
| `CountUp` | Animated number counter | react-countup |
| `ImageGallery` | Lightbox gallery | custom |
| `EmptyState` | Consistent empty states | custom |
| `ErrorBoundary` | Error fallback UI | react |
| `PageTransition` | Route transition wrapper | framer-motion |
| `ScrollReveal` | Intersection observer animations | framer-motion |
| `ParallaxSection` | Parallax scroll effect | framer-motion |
| `MagneticButton` | Magnetic hover effect | framer-motion |
| `RippleButton` | Material Design ripple | custom |
| `CommandPalette` | Search command palette | cmdk |
| `HeroCarousel` | Animated hero slider | embla-carousel-react |
| `StaggerChildren` | Staggered list animation | framer-motion |
| `SkeletonGroup` | Pre-built skeleton layouts | custom |
| `ProgressBar` | Animated progress bar | framer-motion |
| `TabGroup` | Animated tab switching | framer-motion + radix |

#### 1.3 Dark Mode Rewrite
**Remove** all 350+ `!important` CSS overrides. Use Tailwind's native `dark:` variant:
```css
/* Before (WRONG): */
html.dark .bg-white { background-color: #1a2332 !important; }

/* After (CORRECT): */
/* In components: */
<div className="bg-white dark:bg-[#1a2332]">
```

---

### Phase 2: Header & Navigation Overhaul
**Goal**: Modern glass-morphism header with smooth animations

#### Changes:
- **Glass morphism**: `backdrop-blur-xl bg-white/80 dark:bg-[#0b1120]/80`
- **Scroll shrink**: Height reduces from `h-20` to `h-16` on scroll (Framer Motion)
- **Active link indicator**: Animated underline/slide indicator
- **Dropdown animations**: Scale + fade + slide (Framer Motion)
- **Mobile menu**: Full-screen overlay with staggered item animation
- **User avatar**: Animated ring on hover, pulse on notification
- **Theme toggle**: Animated sun/moon rotation
- **Language toggle**: Animated globe spin

#### Files:
- `src/components/layout/header.tsx` — Full rewrite
- `src/components/layout/mobile-menu.tsx` — New component
- `src/components/layout/search-overlay.tsx` — Add cmdk command palette

---

### Phase 3: Homepage Redesign
**Goal**: Stunning hero with parallax, animated stats, staggered content reveals

#### 3.1 Hero Section
- **Parallax background**: Image moves slower than scroll (Framer Motion `useScroll`)
- **Animated text**: Word-by-word or letter-by-letter reveal
- **Floating elements**: Decorative shapes with `float` animation
- **CTA buttons**: Magnetic hover + ripple effect on click
- **Gradient overlay**: Animated gradient shift

#### 3.2 Statistics Section
- **CountUp numbers**: Animated from 0 to value on scroll into view
- **Icon animation**: Icons scale up with stagger delay
- **Card hover**: 3D tilt effect on hover
- **Background**: Subtle gradient or pattern

#### 3.3 News/Events/Projects Sections
- **Staggered grid**: Cards appear one by one with `staggerChildren`
- **Card hover**: Scale + shadow elevation + image zoom
- **Skeleton loading**: While data loads
- **Empty state**: If no content

#### 3.4 CTA Section
- **Animated gradient background**: Slow color shift
- **Particle effects**: Optional decorative particles
- **Button hover**: Glow + scale

#### Files:
- `src/app/[lang]/page.tsx` — Major rewrite
- `src/components/ui/hero-section.tsx` — Add parallax
- `src/components/ui/hero-carousel.tsx` — Replace with embla

---

### Phase 4: Card System Overhaul
**Goal**: Consistent, animated card patterns across all pages

#### Card Variants:
```tsx
// News Card — Image top, content bottom, hover zoom
// Event Card — Date badge left, content right, border accent
// Project Card — Status badge, progress bar, hover lift
// Post Card — Facebook-like with reactions, comments
// Member Card — Avatar, role badge, contact icons
// Pricing Card — Popular highlight, feature list, CTA
// Gallery Card — Image with overlay title on hover
// Board Card — Photo, name, title, social links
```

#### Animation Pattern:
```tsx
<motion.div
  whileHover={{ y: -8, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
```

#### Files:
- `src/components/cards/news-card.tsx` — New
- `src/components/cards/event-card.tsx` — New
- `src/components/cards/project-card.tsx` — New
- `src/components/cards/member-card.tsx` — New
- `src/components/cards/gallery-card.tsx` — New
- All page files using cards — Update

---

### Phase 5: Form System Overhaul
**Goal**: Beautiful, accessible forms with real-time validation and animations

#### Changes:
- **统一 Input component**: All forms use `<Input>` from `src/components/ui/input.tsx`
- **Animated labels**: Floating labels that animate on focus
- **Validation feedback**: Real-time validation with animated error messages
- **Multi-step forms**: Animated step transitions (registration, membership apply)
- **File upload**: Drag-and-drop with preview grid
- **Select menus**: Custom animated select with search
- **Switch/toggle**: Animated toggle switches
- **Date picker**: Custom calendar component
- **Form submission**: Loading state with progress indicator

#### Files:
- `src/components/ui/input.tsx` — Upgrade with floating labels
- `src/components/ui/select.tsx` — Upgrade with search
- `src/components/ui/switch.tsx` — New
- `src/components/ui/date-picker.tsx` — New
- `src/components/ui/form-group.tsx` — New wrapper
- `src/app/auth/login/page.tsx` — Redesign
- `src/app/auth/register/page.tsx` — Redesign with animated steps
- `src/app/[lang]/membership/apply/page.tsx` — Redesign
- `src/app/[lang]/contact/page.tsx` — Redesign

---

### Phase 6: Page Transitions & Navigation
**Goal**: Smooth SPA-like transitions between pages

#### Changes:
- **Page transition wrapper**: Fade + slide animation on route change
- **Loading indicator**: Top progress bar (like YouTube)
- **Back/forward**: Different animation direction based on navigation
- **Preloading**: Hover prefetch for nav links
- **Scroll to top**: Smooth scroll on navigation

#### Files:
- `src/app/[lang]/layout-shell.tsx` — Add PageTransition wrapper
- `src/components/layout/page-transition.tsx` — New
- `src/components/layout/top-progress-bar.tsx` — New
- `src/components/layout/header.tsx` — Add prefetch on hover

---

### Phase 7: Scroll Animations & Micro-interactions
**Goal**: Elements animate into view, interactive feedback everywhere

#### Scroll Reveal Patterns:
```tsx
// Fade in up
<ScrollReveal direction="up" delay={0.1}>

// Slide in from left/right
<ScrollReveal direction="left" delay={0.2}>

// Scale in
<ScrollReveal direction="scale" delay={0.3}>

// Stagger children
<StaggerChildren staggerDelay={0.1}>
  {items.map(item => <Card key={item.id} />)}
</StaggerChildren>
```

#### Micro-interactions:
- **Buttons**: Ripple on click, scale on hover
- **Links**: Underline slide animation
- **Images**: Scale on hover with overlay
- **Icons**: Bounce/rotate on hover
- **Cards**: 3D tilt on mouse move
- **Social icons**: Color + scale on hover
- **Theme toggle**: Sun/moon rotation

#### Files:
- `src/components/ui/scroll-reveal.tsx` — New (Intersection Observer + Framer Motion)
- `src/components/ui/stagger-children.tsx` — New
- `src/components/ui/magnetic-button.tsx` — New
- `src/components/ui/ripple-button.tsx` — New
- `src/components/ui/tilt-card.tsx` — New
- All page files — Add scroll animations

---

### Phase 8: Toast & Notification System
**Goal**: Replace all `alert()` with beautiful toast notifications

#### Toast Types:
```tsx
import { toast } from "sonner";

toast.success("تم الحفظ بنجاح");
toast.error("حدث خطأ");
toast.info("تم نسخ الرابط");
toast.warning("هذا الإجراء يحتاج تأكيد");
toast.promise(saveData(), { loading: "جاري الحفظ...", success: "تم!", error: "فشل" });
```

#### Files:
- `src/app/layout.tsx` — Add `<Toaster />`
- All files using `alert()` — Replace with toast
- `src/components/ui/toast.tsx` — Upgrade or remove (use sonner)

---

### Phase 9: Gallery & Media Overhaul
**Goal**: Beautiful masonry gallery with lightbox and smooth transitions

#### Changes:
- **Masonry grid**: CSS columns or masonry layout
- **Lightbox**: Full-screen image viewer with swipe
- **Image lazy loading**: Intersection Observer
- **Placeholder blur**: Low-quality image placeholder
- **Video player**: Custom controls with animations
- **Publication viewer**: PDF viewer with smooth page turns

#### Files:
- `src/app/[lang]/media/gallery/page.tsx` — Redesign
- `src/components/ui/lightbox.tsx` — New
- `src/components/ui/masonry-grid.tsx` — New
- `src/app/[lang]/media/videos/page.tsx` — Redesign
- `src/app/[lang]/media/publications/feed-client.tsx` — Enhance

---

### Phase 10: Admin Panel Redesign
**Goal**: Professional admin dashboard with charts, animations, consistent design

#### Changes:
- **Dashboard charts**: Animated charts (CSS-only or recharts)
- **Data tables**: Sortable, filterable with animations
- **CRUD forms**: Animated modals with form validation
- **Activity feed**: Real-time activity with animations
- **Stats cards**: Animated counters with trend indicators
- **Sidebar**: Collapsible with smooth animation
- **Dark mode**: Proper `dark:` variants (remove `!important` overrides)

#### Files:
- `src/app/ai.admin/layout.tsx` — Redesign sidebar
- `src/app/ai.admin/page.tsx` — Dashboard with charts
- All admin pages — Consistent card/form patterns
- `src/app/globals.css` — Remove dark mode overrides

---

### Phase 11: Auth Pages Redesign
**Goal**: Beautiful login/register with split-screen design

#### Design:
```
┌─────────────────────────────────────────┐
│  Left Side (60%)     │  Right Side (40%) │
│                      │                   │
│  [Animated Logo]     │  [Background      │
│  [Form with          │   Image/Gradient] │
│   floating labels]   │                   │
│  [Social login]      │  [Quote/          │
│  [Remember me]       │   Testimonial]    │
│  [Forgot password]   │                   │
└─────────────────────────────────────────┘
```

#### Files:
- `src/app/auth/login/page.tsx` — Full redesign
- `src/app/auth/register/page.tsx` — Full redesign with animated steps
- `src/app/auth/forgot-password/page.tsx` — Redesign
- `src/app/auth/verify/page.tsx` — Redesign

---

### Phase 12: Performance & Polish
**Goal**: Optimize animations, lazy load, reduce bundle

#### Changes:
- **Lazy load**: Heavy components (gallery, video player)
- **Code splitting**: Dynamic imports for Framer Motion
- **Reduced motion**: Respect `prefers-reduced-motion`
- **Image optimization**: Next/Image for all images
- **Bundle analysis**: Remove unused dependencies
- **Lighthouse audit**: Target 90+ score

#### Files:
- All component files — Add `dynamic()` imports
- `src/app/globals.css` — Add `@media (prefers-reduced-motion: reduce)`
- `next.config.ts` — Add image optimization config

---

## Implementation Order

| Phase | Effort | Impact | Priority |
|-------|--------|--------|----------|
| 1. Design System | Medium | High | 🔴 First |
| 2. Header & Nav | Medium | High | 🔴 First |
| 3. Homepage | Large | High | 🔴 First |
| 4. Card System | Medium | High | 🟡 Second |
| 5. Form System | Medium | Medium | 🟡 Second |
| 6. Page Transitions | Small | High | 🟡 Second |
| 7. Scroll Animations | Medium | High | 🟡 Second |
| 8. Toast System | Small | Medium | 🟢 Third |
| 9. Gallery & Media | Medium | Medium | 🟢 Third |
| 10. Admin Panel | Large | Medium | 🟢 Third |
| 11. Auth Pages | Medium | Medium | 🟢 Third |
| 12. Performance | Small | High | 🔴 Last |

**Estimated Total Effort**: 40-60 hours
**Recommended Sprint Plan**: 4 sprints of 2 weeks each

---

## Libraries Already Installed

```json
{
  "framer-motion": "^12.x",        // Animations
  "class-variance-authority": "^0.7.x",  // Component variants
  "sonner": "^2.x",                // Toast notifications
  "cmdk": "^1.x",                  // Command palette
  "embla-carousel-react": "^8.x",  // Carousels
  "@radix-ui/react-dialog": "^1.x", // Accessible dialogs
  "@radix-ui/react-dropdown-menu": "^2.x",
  "@radix-ui/react-tooltip": "^1.x",
  "@radix-ui/react-popover": "^1.x",
  "@radix-ui/react-tabs": "^1.x",
  "@radix-ui/react-accordion": "^1.x",
  "@radix-ui/react-avatar": "^1.x",
  "@radix-ui/react-progress": "^1.x",
  "@radix-ui/react-select": "^2.x",
  "@radix-ui/react-switch": "^1.x",
  "@radix-ui/react-separator": "^1.x",
  "@radix-ui/react-scroll-area": "^1.x",
  "tailwindcss-animate": "^1.x",   // Animation utilities
  "react-countup": "^6.x",         // Number animation
  "clsx": "^2.x",                  // Class merging
  "tailwind-merge": "^3.x",        // Tailwind class dedup
  "lucide-react": "^0.511.x",      // Icons
  "@radix-ui/react-slot": "^1.x",  // Component composition
  "react-easy-crop": "^6.x",       // Image cropping
  "qrcode.react": "^4.x",          // QR codes
  "html2canvas": "^1.x"            // Screenshot
}
```

---

## Design Principles

1. **Consistency**: Same patterns across all 80+ pages
2. **Motion with purpose**: Animations guide attention, not distract
3. **Arabic-first**: RTL-aware animations, proper text alignment
4. **Dark mode native**: Use `dark:` variants, not CSS overrides
5. **Accessibility**: `prefers-reduced-motion`, focus rings, ARIA labels
6. **Performance**: Lazy load heavy components, optimize images
7. **Mobile-first**: Responsive at every breakpoint
8. **Progressive enhancement**: Works without JS, enhanced with it
