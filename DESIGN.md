---
name: Sequoia Glass
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e5'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fe'
  surface-container: '#ecedf9'
  surface-container-high: '#e6e8f3'
  surface-container-highest: '#e0e2ed'
  on-surface: '#181c23'
  on-surface-variant: '#414755'
  inverse-surface: '#2d3039'
  inverse-on-surface: '#eef0fc'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006e28'
  on-secondary: '#ffffff'
  secondary-container: '#6ffb85'
  on-secondary-container: '#00732a'
  tertiary: '#9e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#72fe88'
  secondary-fixed-dim: '#53e16f'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#00531c'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#f9f9ff'
  on-background: '#181c23'
  surface-variant: '#e0e2ed'
  indigo: '#5856d6'
  purple: '#af52de'
  orange: '#ff9500'
  pink: '#ff2d55'
  incoming-bubble-light: '#e9e9eb'
  incoming-bubble-dark: '#262629'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.4px
  title-md:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.2px
  body-regular:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.1px
  body-medium:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.1px
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0px
  micro:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.2px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-1: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-6: 24px
  space-8: 32px
---

## Brand & Style

This design system captures the premium, integrated essence of macOS Sequoia and iOS 18. The brand personality is professional, sleek, and high-tech, prioritizing the "Apple Aesthetic" to evoke a sense of familiarity and ecosystem continuity for web users.

The core design style is **Glassmorphism**. Surfaces are treated as physical glass layers rather than flat colored containers. By utilizing heavy background blurs and high saturation levels, the UI allows underlying wallpapers to bleed through, creating a "Vibrant Mica" effect. This depth-driven approach ensures the interface feels lightweight and natively integrated into the modern desktop environment. High-contrast typography and precise geometry balance the ethereal nature of the glass surfaces with functional clarity.

## Colors

The palette is rooted in Apple’s system colors, optimized for two distinct modes:

- **Surface Strategy**: Avoid solid fills. Use translucent white/black with high alpha values (68%–72%) for main window containers to enable the frosted glass effect.
- **Dynamic Accents**: The primary accent is **Apple Blue**, but the system supports user-selectable themes including Emerald Green, Indigo, Purple, Orange, and Pink. These are applied as vertical gradients on outgoing message bubbles and active states.
- **Functional Neutrals**: Use semantic tokens for text. Primary text uses near-black (#1d1d1f) in light mode and near-white (#f5f5f7) in dark mode to ensure accessibility against vibrant backgrounds.
- **Message Logic**: Outgoing bubbles adopt the current accent theme gradient. Incoming bubbles use a neutral, low-contrast gray to differentiate the conversation flow.

## Typography

The typography system uses **Inter** as a functional equivalent to SF Pro, maintaining a clean, humanist-grotesque appearance that excels in high-density messaging environments.

- **Scale**: The hierarchy is tight, with small increments between body and titles to mirror the compact nature of desktop OS interfaces.
- **Message Rendering**: All chat messages use the `body-regular` level. Names in the sidebar use `body-medium` for better scannability.
- **Optimization**: Negative letter spacing is applied to larger sizes (`headline-lg`) to maintain a "tight" editorial feel, while micro-labels use positive tracking for legibility at small scales.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to replicate the standalone app experience, transitioning to a fluid stack for mobile.

- **Desktop Window**: Fixed at 1180px x 840px. It features a three-pane architecture: Sidebar (340px), Main Chat (Fluid), and Details (300px).
- **Mobile/Tablet**: Below 1024px, the layout becomes fluid. On mobile, it utilizes a drill-down navigation pattern where the sidebar occupies 100% of the viewport until a thread is selected.
- **Rhythm**: An 8-point grid governs all internal spacing. Gutters between the primary panels are defined by a 1px "Panel Border" token, while internal padding defaults to `space-4` (16px).

## Elevation & Depth

Visual hierarchy is achieved through material properties rather than traditional shadows:

- **Backdrop Blur**: The primary method of separation. Main window containers use a **32px blur**. Overlays and popovers use a slightly lighter **20px blur** to feel "closer" to the user.
- **Vibrancy**: Backgrounds must have a **190% saturation** filter applied to the blur to prevent the UI from looking "muddy" over dark wallpapers.
- **Glass Edge**: Every glass surface features a 1px internal stroke (`rgba(255, 255, 255, 0.4)`) on the top and left sides to simulate a light-catching bezel.
- **Window Shadows**: Only the outermost container uses a deep, diffused drop shadow (50px blur, 25px offset) to lift the entire application off the system desktop.

## Shapes

The shape language is sophisticated and varied based on the component's role:

- **Containers**: The main application window uses a large **24px radius** to match macOS Sequoia window frames. Internal panels like sidebars have 0px radius where they meet the frame but 20px on external corners.
- **Message Bubbles**: A consistent **18px radius** is used. A specialized "tail" logic applies: outgoing bubbles have a 4px radius on the bottom-right corner; incoming bubbles have a 4px radius on the bottom-left.
- **Interactive Elements**: Input fields and search bars use a "Pill" shape (20px radius). Avatars should be rendered as circles (50%) or "Squircles" (using a 12px radius with high curvature).

## Components

### Traffic Lights
The window chrome includes the signature macOS Red, Yellow, and Green buttons in the top-left of the sidebar. They should be 12px in diameter with 8px spacing.

### Sidebar
Items use a "hover-to-reveal" highlight. Active threads use a semi-transparent version of the primary accent color or a subtle gray wash in light mode.

### Chat Bubbles
- **Outgoing**: Gradient fill (Accent Theme), white text.
- **Incoming**: Light Gray (#e9e9eb) or Dark Gray (#262629) fill, primary text color.
- **Tail Logic**: The sharpest corner (4px) points toward the edge of the screen relevant to the sender.

### Input Composer
A full-width pill-shaped container. It features a "Glass" background (low opacity) and houses the "A" (App Store), Photos, and Dictation icons as monochromatic glyphs. The send button is a circle with an upward arrow, active only when text is present.

### Typing Indicator
Three staggered gray dots with a 300ms bounce animation, housed in a standard incoming bubble container.

---

## 8. Figma Visual Catalog & Screen Mapping

All high-fidelity Figma exports are located in [`figma-images/`](file:///d:/Work%20Space/iMessage/figma-images).

### 8.1 Desktop Screens

| Screen Name | Figma Asset | Viewport | Key Design Patterns |
| :--- | :--- | :--- | :--- |
| **Desktop Main (Light Mode)** | [`figma-images/main.png`](file:///d:/Work%20Space/iMessage/figma-images/main.png) | 1180px × 840px | Sequoia Glass, 3-pane architecture, traffic lights, segmented tabs, audio scrubber, photo card |
| **Desktop Main (Dark Mode)** | [`figma-images/main-screen-dark.png`](file:///d:/Work%20Space/iMessage/figma-images/main-screen-dark.png) | 1180px × 840px | Dark translucent mica, deep contrast typography, accent glow, dark gray incoming bubbles |
| **Desktop Settings & Preferences** | [`figma-images/setting.png`](file:///d:/Work%20Space/iMessage/figma-images/setting.png) | 1180px × 840px | macOS Settings sidebar, accent swatch picker, theme toggle, privacy & read receipt controls |
| **Desktop Media Lightbox** | [`figma-images/lightbox.png`](file:///d:/Work%20Space/iMessage/figma-images/lightbox.png) | 1180px × 840px | Fullscreen dark frosted blur, filmstrip bottom carousel, zoom & download actions |

### 8.2 Security & Authentication Screens

| Screen Name | Figma Asset | Viewport | Key Design Patterns |
| :--- | :--- | :--- | :--- |
| **Lock Screen Overlay** | [`figma-images/lock-screen.png`](file:///d:/Work%20Space/iMessage/figma-images/lock-screen.png) | 1180px × 840px | Frosted glass overlay (40px blur), avatar glow ring, password field, switch user action |
| **Authentication Flow** | [`figma-images/auth.png`](file:///d:/Work%20Space/iMessage/figma-images/auth.png) | 1180px × 840px | Split screen, glass card login form, animated macOS Sequoia mesh wallpaper |

### 8.3 Mobile Screens (iOS 18)

| Screen Name | Figma Asset | Viewport | Key Design Patterns |
| :--- | :--- | :--- | :--- |
| **Mobile Chat (Light Mode)** | [`figma-images/mobile-chat.png`](file:///d:/Work%20Space/iMessage/figma-images/mobile-chat.png) | 390px × 844px | Drill-down navigation, `< Back` button, floating pill composer, iOS status bar |
| **Mobile Chat (Dark Mode)** | [`figma-images/mobile-chat-dark.png`](file:///d:/Work%20Space/iMessage/figma-images/mobile-chat-dark.png) | 390px × 844px | Dark theme iOS stack, high-contrast bubbles, double blue read ticks |
| **Mobile Media Lightbox** | [`figma-images/mobile-lightbox.png`](file:///d:/Work%20Space/iMessage/figma-images/mobile-lightbox.png) | 390px × 844px | Touch gestures, pinch-to-zoom, floating bottom download & share bar |
| **Mobile Settings Redesign** | [`figma-images/mobile-setting.png`](file:///d:/Work%20Space/iMessage/figma-images/mobile-setting.png) | 390px × 844px | iOS grouped inset list style, toggle switches, accent selection sheet |