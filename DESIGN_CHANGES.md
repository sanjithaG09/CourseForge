# CourseForge — Design Changes

## Color Palette Overhaul

The entire interface has been redesigned from a **purple** theme to a **deep navy + teal/sky** theme.
This gives a unique, tech-forward, professional look distinct from Udemy, Coursera, or Skillshare.

### Color Token Changes

| Token | Old (Purple) | New (Teal) |
|---|---|---|
| `--accent` | `#7c5cfc` | `#0ea5e9` (sky-500) |
| `--accent2` | `#a78bfa` | `#38bdf8` (sky-400) |
| `--accent-dark` | `#6b4de8` | `#0284c7` (sky-600) |
| `--accent-glow` | `rgba(124,92,252,0.3)` | `rgba(14,165,233,0.28)` |
| Background base | `#0a0a0f` (near-black) | `#060910` (deep navy-black) |
| `--bg2` | `#11111a` | `#0d1117` |
| `--bg3` | `#181825` | `#131b24` |
| `--bg4` | `#1f1f30` | `#1a2332` |

A new **emerald** secondary accent was added (`#10b981`) used in gradients alongside teal.

---

## Typography Change

| Old | New |
|---|---|
| Syne (display) | **Space Grotesk** — geometric, modern, unique |
| DM Sans (body) | **Plus Jakarta Sans** — clean, professional, highly legible |

---

## Visual Improvements Per Component

### Auth Pages (Login / Register / Forgot Password)
- Grid-mesh background pattern (subtle CSS background-image lines)
- Top gradient accent line on the card (`teal → emerald`)
- Card has a faint teal border glow
- OTP boxes now 50×58px with better focus ring
- Active step dots have a subtle glow shadow
- Password toggle hover turns teal

### Sidebar
- Active nav item now shows a **left border accent** (2px teal line)
- Logo icon uses `teal → emerald` gradient
- User avatar border glow
- Subtle top glow line

### Landing Page
- Animated live dot in the hero badge
- Grid-mesh overlay on hero background
- Feature cards get a top gradient line on hover (instead of just border color)
- Feature icons are now in a styled icon box (not just emoji)
- CTA section has a subtle radial glow
- Section eyebrow labels added above section titles

### All Cards / Stat Cards
- Hover state adds a teal box-shadow glow
- Stat cards lift with a soft teal shadow on hover

### Progress Bars
- Now gradient from `teal → emerald` (instead of purple)

### Email Templates
- Full HTML email redesign with teal accent bar
- Professional OTP block with monospace font
- Cleaner footer and note block
- Consistent with the web UI color language

---

## Files Changed

```
frontend/src/styles/global.css         ← full rewrite
frontend/src/pages/Auth.css            ← full rewrite
frontend/src/pages/Landing.css         ← full rewrite
frontend/src/components/Sidebar.css    ← full rewrite
frontend/src/pages/Dashboard.css       ← color tokens replaced
frontend/src/pages/CourseDetail.css    ← color tokens replaced
frontend/src/pages/CourseForm.css      ← color tokens replaced
frontend/src/pages/CourseList.css      ← color tokens replaced
frontend/src/pages/Courses.css         ← color tokens replaced
frontend/src/pages/InstructorCourses.css   ← color tokens replaced
frontend/src/pages/InstructorDashboard.css ← color tokens replaced
frontend/src/pages/MyLearning.css      ← color tokens replaced
frontend/src/pages/Profile.css         ← color tokens replaced
frontend/src/pages/Wishlist.css        ← color tokens replaced
frontend/src/components/CourseCard.css ← color tokens replaced
utils/emailService.js                  ← redesigned HTML emails
.env                                   ← added email setup instructions
EMAIL_SETUP.md                         ← new guide
DESIGN_CHANGES.md                      ← this file
```

All **features remain identical** — only appearance was changed.
