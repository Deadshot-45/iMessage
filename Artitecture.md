# iMessage Web — System Architecture & Figma / Stitch Design Reference Guide

> **Version**: 2.0.0  
> **Aesthetic Profile**: Apple macOS Sequoia & iOS 18 Frosted Glassmorphism (Vibrant Mica & Glass)  
> **Purpose**: Complete design system blueprint, token specifications, layout hierarchy, and component reference for creating pixel-perfect Stitch UI prompts, Figma design libraries, wireframes, and prototype workflows.

---

## Table of Contents
1. [Executive System Overview](#1-executive-system-overview)
2. [Global Design System & Foundation Tokens](#2-global-design-system--foundation-tokens)
   - 2.1 Color Palette & Accent Themes
   - 2.2 Glassmorphism, Elevation & Surface Tokens
   - 2.3 Typography Hierarchy
   - 2.4 Spacing, Grids & Corner Radii
3. [Figma Component Library & Stitch UI Primitives](#3-figma-component-library--stitch-ui-primitives)
   - 3.1 macOS Window Chrome & App Header
   - 3.2 Sidebar & Navigation Modules
   - 3.3 Chat Thread & Message Bubble Anatomy
   - 3.4 Progressive Media & Lightbox Engine
   - 3.5 Chat Input Composer & Attachment Trays
   - 3.6 Details & Contact Info Slide-Over Panel
   - 3.7 Authentication & Lock Screen Screens
4. [Responsive Layout & Auto-Layout Specifications](#4-responsive-layout--auto-layout-specifications)
   - 4.1 Desktop Viewport (1180px × 840px Fixed Window)
   - 4.2 Tablet Viewport (768px – 1023px)
   - 4.3 Mobile Viewport (< 768px Full-Screen Stack)
5. [Interaction States, Badges & Micro-Interactions](#5-interaction-states-badges--micro-interactions)
   - 5.1 Message Delivery & Read Receipts Logic (Tick System)
   - 5.2 Presence & Typing Indicators
   - 5.3 Empty States & Error Handling
6. [Stitch AI Prompting Templates & Reference Guide](#6-stitch-ai-prompting-templates--reference-guide)
7. [Code-to-Design Mapping Table](#7-code-to-design-mapping-table)
8. [End-to-End Encryption (E2EE) Cryptographic Architecture](#8-end-to-end-encryption-e2ee-cryptographic-architecture)
   - 8.1 Zero-Knowledge Threat & Trust Model
   - 8.2 Client-Side Key Hierarchy & Web Crypto Primitives
   - 8.3 Asynchronous Key Agreement (X3DH Protocol)
   - 8.4 Message Ratcheting & Forward Secrecy
   - 8.5 Progressive Media Out-of-Band Encryption
   - 8.6 MITM Prevention (60-Digit Safety Numbers)

---

## 1. Executive System Overview

The **iMessage Web Application** is a high-fidelity cloud-native messaging platform faithfully reproducing Apple's iMessage interface across macOS and iOS ecosystems.

```
+-----------------------------------------------------------------------------------+
|                                 APPLICATION SHELL                                 |
|                                                                                   |
|  +-----------------------+  +-------------------------------+  +---------------+  |
|  |     SIDEBAR (30%)     |  |       CHAT CANVAS (50%)       |  | DETAILS (20%) |  |
|  | - macOS Traffic Light |  | - Recipient Header Toolbar    |  | - Hero Avatar |  |
|  | - Search & Filter     |  | - Scrollable Message History  |  | - User Bio    |  |
|  | - Segmented Tabs      |  | - Progressive Media Cards     |  | - Shared Media|  |
|  | - Conversation List   |  | - Message Input Bar & Emoji   |  | - Theme Switch|  |
|  | - Friend Requests     |  | - Typing & Status Ticks       |  | - Mute/Block  |  |
|  +-----------------------+  +-------------------------------+  +---------------+  |
+-----------------------------------------------------------------------------------+
```

### Key Technical & Visual Pillars
- **Real-Time Engine**: WebSocket bidirectional synchronization (Socket.io) with instant local state optimistic UI rendering.
- **Glassmorphic Compositing**: Dynamic backdrop-blur (`blur(32px)`), high saturation (`190%`), and sub-pixel edge borders (`rgba(255,255,255,0.12)`).
- **Adaptive Theming**: Native Light & Dark modes with dynamic Accent Hue blending (`color-mix(in srgb, ...)`).

---

## 2. Global Design System & Foundation Tokens

### 2.1 Color Palette & Accent Themes

#### Base Surfaces & Neutral Tones
| Token Name | Light Mode (Hex / OKLCH) | Dark Mode (Hex / OKLCH) | Usage |
| :--- | :--- | :--- | :--- |
| `--app-bg` | `linear-gradient(135deg, #e0eafc, #cfdef3)` | `linear-gradient(135deg, #0f172a, #1e293b)` | Full-screen app backdrop |
| `--win-bg` | `rgba(255, 255, 255, 0.72)` | `rgba(22, 22, 28, 0.72)` | Main window container |
| `--sidebar-bg` | `rgba(246, 246, 246, 0.58)` | `rgba(30, 30, 38, 0.58)` | Left sidebar panel |
| `--chat-bg` | `rgba(255, 255, 255, 0.68)` | `rgba(18, 18, 24, 0.68)` | Center chat canvas |
| `--panel-border`| `rgba(0, 0, 0, 0.08)` | `rgba(255, 255, 255, 0.06)` | Column dividers & borders |
| `--text-primary`| `#1d1d1f` | `#f5f5f7` | Primary headlines & message text |
| `--text-secondary`| `#86868b`| `#a1a1a6` | Timestamps, search icons, subheadings |
| `--text-muted` | `#afafb6` | `#636366` | Placeholder text, disabled labels |

#### Accent Theme Palette (Dynamic Switchable)
| Theme Name | Primary Hex | Gradient CSS | Meaning / Mood |
| :--- | :--- | :--- | :--- |
| **Apple Blue** (Default) | `#007aff` | `linear-gradient(180deg, #3a9cff 0%, #007aff 100%)` | Iconic iMessage identity |
| **Emerald Green** | `#34c759` | `linear-gradient(180deg, #5be07e 0%, #34c759 100%)` | SMS/Vibrant energy |
| **Electric Indigo** | `#5856d6` | `linear-gradient(180deg, #7c7af2 0%, #5856d6 100%)` | Creative & modern |
| **Orchid Purple** | `#af52de` | `linear-gradient(180deg, #c774ee 0%, #af52de 100%)` | Playful & rich |
| **Sunset Orange** | `#ff9500` | `linear-gradient(180deg, #ffab38 0%, #ff9500 100%)` | Warm & friendly |
| **Passion Pink** | `#ff2d55` | `linear-gradient(180deg, #ff5c7d 0%, #ff2d55 100%)` | Bold & energetic |

#### Message Bubble Colors
- **Outgoing (Sent Bubble)**: `var(--imessage-blue)` or active accent with text `#ffffff`.
- **Incoming (Received Bubble - Light)**: `#e9e9eb` with text `#000000`.
- **Incoming (Received Bubble - Dark)**: `#262629` with text `#ffffff`.

---

### 2.2 Glassmorphism, Elevation & Surface Tokens

#### Figma Effect Styles
```
[Style: Glass-Window]
- Background: rgba(255, 255, 255, 0.72) (Light) / rgba(22, 22, 28, 0.72) (Dark)
- Background Blur: 32px (Saturation: 190%)
- Inner Shadow: Y: 1px, Blur: 0px, Color: rgba(255, 255, 255, 0.4)
- Drop Shadow: Y: 25px, Blur: 50px, Spread: -12px, Color: rgba(0, 0, 0, 0.25)
- Stroke (Inside 1px): rgba(255, 255, 255, 0.3) (Light) / rgba(255, 255, 255, 0.08) (Dark)

[Style: Glass-Card-Hover]
- Background: rgba(0, 122, 255, 0.10) (Selected item) / rgba(0, 0, 0, 0.03) (Hover item)
- Transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1)

[Style: Popover-Dropdown]
- Background: rgba(30, 30, 38, 0.92)
- Backdrop Blur: 20px
- Shadow: Y: 12px, Blur: 30px, Color: rgba(0, 0, 0, 0.35)
- Corner Radius: 14px
```

---

### 2.3 Typography Hierarchy

Primary Typeface: **SF Pro Display** / **SF Pro Text** (Fallback: `Inter`, `-apple-system`, `sans-serif`)

| Level | Size (px) | Weight | Line Height | Letter Spacing | Figma Text Style |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero / Title 1** | 22px | 700 (Bold) | 28px | -0.4px | `Typography/Display-Large` |
| **Section / Title 2**| 17px | 600 (Semibold)| 22px | -0.2px | `Typography/Title-Medium` |
| **Body / Message** | 15px | 400 (Regular) | 20px | -0.1px | `Typography/Body-Regular` |
| **Callout / Bold Body**| 15px| 500 (Medium) | 20px | -0.1px | `Typography/Body-Medium` |
| **Subhead / Captions** | 13px | 400 (Regular) | 16px | 0px | `Typography/Caption-Regular` |
| **Micro / Timestamp** | 11px | 400 (Regular) | 14px | +0.2px | `Typography/Micro-Label` |

---

### 2.4 Spacing, Grids & Corner Radii

#### 8-Point Spacing Grid
- `space-1` = 4px (tight badge & tick gap)
- `space-2` = 8px (icon padding, bubble margin)
- `space-3` = 12px (list item gap, input padding)
- `space-4` = 16px (panel margins, card padding)
- `space-6` = 24px (window container margin)
- `space-8` = 32px (modal interior padding)

#### Corner Radius System
- **Window Frame**: `24px` (`rounded-3xl`)
- **Modals / Sheets**: `20px` (`rounded-2xl`)
- **Message Bubbles**: `18px` (`rounded-[18px]`) with tail corner reduced to `4px`
- **Input Pill**: `20px` (`rounded-full`)
- **Badges & Avatar**: `50%` (`rounded-full`) or `12px` (Squircle)

---

## 3. Figma Component Library & Stitch UI Primitives

### 3.1 macOS Window Chrome & App Header

#### Traffic Lights Component (Figma: `Components/macOS/TrafficLights`)
- **Frame**: Auto-layout Horizontal, Spacing `8px`, Width `52px`, Height `12px`
- **Close Button**: Circle `12px × 12px`, Fill `#ff5f56`, Border `0.5px rgba(0,0,0,0.12)` (Hover: `×` symbol)
- **Minimize Button**: Circle `12px × 12px`, Fill `#ffbd2e`, Border `0.5px rgba(0,0,0,0.12)` (Hover: `−` symbol)
- **Maximize Button**: Circle `12px × 12px`, Fill `#27c93f`, Border `0.5px rgba(0,0,0,0.12)` (Hover: `+` symbol)

#### Header Action Controls
- **User Profile Pill**: Clerk Avatar (`32px`) + Name Tag + Online Indicator badge.
- **Header Action Group**:
  - `Phone Button`: `32px × 32px` frosted circular button with Lucide `Phone` icon.
  - `Video Button`: `32px × 32px` frosted circular button with Lucide `Video` icon.
  - `Details / Info Button`: `32px × 32px` button with Lucide `Info` icon (Toggles right panel).
  - `Theme / Wallpaper Pickers`: Quick popover triggers.

---

### 3.2 Sidebar & Navigation Modules

```
+-------------------------------------------------------------+
| [● ● ●]   Messages                   [⚙ Preferences] [User] |
| +---------------------------------------------------------+ |
| | 🔍 Search conversations or users...                      | |
| +---------------------------------------------------------+ |
| [ Chats (4) ]  [ Contacts ]  [ Discover ]  [ Requests (2) ] |
|-------------------------------------------------------------|
| (●) Sarah Jenkins                     10:42 AM              |
|     Hey, did you review the Figma...        [ 1 ] [✓✓]      |
|-------------------------------------------------------------|
| ( ) Alex Rivera                       Yesterday             |
|     [📷 Photo]                                    [✓✓]      |
+-------------------------------------------------------------+
```

#### Search Bar Component (`Components/Sidebar/SearchBar`)
- **Container**: Height `36px`, Radius `10px`, Background `var(--search-bg)`
- **Left Icon**: `Search` (Lucide 15px, `rgba(140, 140, 145, 0.8)`)
- **Placeholder**: `"Search conversations or users..."`

#### Segmented Tab Bar (`Components/Sidebar/SegmentedTabs`)
- **Tabs**:
  1. **Chats**: Active count badge pill (Blue/Accent fill, white bold text).
  2. **Contacts**: Total registered friends list.
  3. **Discover**: Search new users globally with add button.
  4. **Requests**: Pending requests indicator (Badge: Red/Accent dot).

#### Conversation List Row (`Components/Sidebar/ConversationItem`)
- **Height**: `72px`, Padding `12px 16px`, Hover background `var(--hover-list-bg)`, Active background `var(--active-list-bg)`
- **Avatar**: `48px × 48px` circle with presence status dot (Green `12px` border `2px solid var(--sidebar-bg)`).
- **Title Row**: Contact Name (Bold `15px`) + Timestamp (Right-aligned `12px`, muted).
- **Subtitle Row**: Message preview text (Truncated, `13px`) + Delivery ticks / Unread badge pill (`20px × 20px`).

#### Friend Request Row (`Components/Sidebar/FriendRequestItem`)
- **Actions**:
  - **Accept**: Green button (`Check` icon, `30px × 30px`, radius `8px`).
  - **Decline**: Gray/Red button (`X` icon, `30px × 30px`, radius `8px`).

---

### 3.3 Chat Thread & Message Bubble Anatomy

```
               [ Yesterday 8:45 PM ]

 (Avatar) +------------------------------------------+
          | Hey Mayan! Have you tested the new       |
          | audio player waveform component?         |
          +------------------------------------------+ 8:46 PM

          +------------------------------------------+
          | Yes! It plays smoothly in background too |
          | check this out 👇                       |
          +------------------------------------------+ 8:47 PM [✓✓] (Blue)
```

#### Bubble Construction Rules (Auto-Layout)
- **Outgoing Bubble**:
  - Alignment: `Right`
  - Fill: `var(--imessage-blue)` gradient
  - Text Color: `#ffffff`
  - Corner Radii: `Top-Left: 18px`, `Top-Right: 18px`, `Bottom-Left: 18px`, `Bottom-Right: 4px` (Tail)
  - Max Width: `68%` of chat canvas width
- **Incoming Bubble**:
  - Alignment: `Left`
  - Fill: `#e9e9eb` (Light) / `#262629` (Dark)
  - Text Color: `#000000` (Light) / `#ffffff` (Dark)
  - Corner Radii: `Top-Left: 18px`, `Top-Right: 18px`, `Bottom-Left: 4px` (Tail), `Bottom-Right: 18px`
  - Max Width: `68%`

---

### 3.4 Progressive Media & Lightbox Engine

#### Media Delivery Specification Matrix (from `feature.md`)
| Media Type | Sender View | Receiver View (Before Download) | Receiver View (After Download) | Fullscreen Mode |
| :--- | :--- | :--- | :--- | :--- |
| **Image** | Instant full preview | Blurred thumbnail + Download Button + Size Pill | Crystal clear high-res image | Click opens Lightbox Viewer Modal |
| **Video** | Instant playable video | Thumbnail + Download & Play Trigger | Streamable interactive video player | Lightbox modal with scrub control |
| **Audio / Voice** | Instant wave visualizer | Background streamable player with Play/Pause | Background streamable player | N/A (Inline audio scrub) |
| **GIF** | Instant looping anim | Tap to download badge | Smooth animated loop | Fullscreen expand icon |

#### Media Card UI Elements
- **Download Overlay**: Frosted circle button (`44px`) with `Download` (Lucide) icon and progress ring.
- **Corner Actions**:
  - Top-Right: `Trash2` (Delete message icon on hover).
  - Bottom-Right: `Maximize2` (Fullscreen lightbox trigger).
- **Deleted Media State**: Gray placeholder bubble with italic text `"🚫 This media was deleted"`.

---

### 3.5 Chat Input Composer & Attachment Trays

```
+-------------------------------------------------------------------------+
| [ + ]  | Type an iMessage...                             | [ 😊 ] [ 🚀 ]|
+-------------------------------------------------------------------------+
```

#### Composer Anatomy (`Components/Chat/InputComposer`)
- **Container**: Height `48px`, Background `var(--win-bg)`, Radius `24px`, Border `1px solid var(--panel-border)`.
- **Media Attachment Button**: Circle `32px`, `+` icon, opens file picker for Images/Videos/Audio/GIFs.
- **Staging Preview Tray**: Horizontal scrolling pill tray displayed directly above the input bar when a file is selected with quick remove (`×`).
- **Emoji Picker Button**: Lucide `Smile` icon trigger for standard emoji palette.
- **Send Button**: `36px × 36px` circle with dynamic state:
  - Empty text: Disabled muted icon.
  - Active text/media: Solid Accent filled circle with `Send` (or Up-Arrow) white icon.

---

### 3.6 Details & Contact Info Slide-Over Panel

- **Width**: `300px` (Right-pinned slide-over with spring physics)
- **Profile Header**: Large Avatar (`80px`), Full Name (`18px Bold`), Username handle (`@username`), Online status pill.
- **Action Buttons**: Direct Call, Video Call, Mute Chat Toggle.
- **Shared Media Section**: 3-column photo/video thumbnail grid with hover zoom.
- **Preferences**: Theme switcher (Light/Dark), Accent Color picker (6-color swatch), Wallpaper Selector, Sound Effects toggle.

---

### 3.7 Authentication & Lock Screen Screens

- **Auth Layout**: Split-screen design.
  - Left pane: Frosted glass card embedding Clerk `<SignIn />` / `<SignUp />` with Apple-styled buttons.
  - Right pane: Animated Apple mesh gradient backdrop with floating glass conversation cards.
- **Lock Screen Overlay**: Full viewport frosted blur overlay (`backdrop-blur: 40px`) displaying security lock icon, user avatar, and unlock pin / password trigger.

---

## 4. Responsive Layout & Auto-Layout Specifications

```
  DESKTOP (>= 1024px)                     MOBILE (< 768px)
+-----------------------------------+   +-------------------------+
| [Sidebar] [Chat Canvas] [Details] |   | [< Back] Sarah    [ ℹ ] |
|   320px      Flex-1       300px   |   |-------------------------|
|                                   |   | Bubble 1                |
|                                   |   |           Bubble 2 [✓✓] |
|                                   |   |-------------------------|
|                                   |   | [ + ] [ Input... ] [ 🚀]|
+-----------------------------------+   +-------------------------+
```

### 4.1 Desktop Breakpoint (`>= 1024px`)
- Window Mode: `1180px` width × `840px` height floating centered within desktop canvas.
- Sidebar: Fixed width `340px` (shrink-0).
- Chat Canvas: `flex: 1` (fill remaining width).
- Details Panel: Collapsible `300px` drawer.

### 4.2 Tablet Breakpoint (`768px – 1023px`)
- Window expands to `100vw × 100vh` without outer desktop padding.
- Sidebar collapses to `280px` width.
- Details panel opens as an overlay modal rather than third column.

### 4.3 Mobile Breakpoint (`< 768px`)
- Navigation pattern switches from Split-view to **Stack View (View Switcher)**:
  - If `activeChatId === null`: Show full-screen Sidebar (Conversations & Contact search).
  - If `activeChatId !== null`: Show full-screen Chat Canvas with `< Back` navigation arrow button in top header.

---

## 5. Interaction States, Badges & Micro-Interactions

### 5.1 Message Delivery & Read Receipts Logic (Tick System)

| State | Visual Indicator | Meaning / Rule |
| :--- | :--- | :--- |
| **Sent** | 1 Gray Tick (`✓`) | Message dispatched from client and stored in database. |
| **Delivered** | 2 Gray Ticks (`✓✓`) | Recipient is online and socket delivered packet to device. |
| **Read** | 2 Blue Ticks (`✓✓` `#007aff`) | Recipient has active chat window open and focused. |

### 5.2 Presence & Typing Indicators
- **Typing Bubble**: Three animated pulsing dots (`300ms` staggered bounce) enclosed in a mini gray bubble.
- **Online Badge**: Green circle (`#34c759`) positioned at bottom-right corner of user avatar.
- **Sound Effects**: Instant audio chimes for message sent (`send.mp3`), message received (`receive.mp3`), and friend request notifications (`friend-request.mp3`).

---

## 6. Stitch AI Prompting Templates & Reference Guide

When prompting **Google Stitch** or generating Figma design frames, use these exact prompt structures for maximum fidelity:

### Stitch Prompt: Main macOS iMessage Desktop Window
```text
Create a modern Apple macOS Sequoia iMessage desktop web application window (1180px width, 840px height) with frosted glassmorphism (32px background blur, subtle 1px translucent border, 24px rounded corners).

Include three columns:
1. Left Sidebar (340px): macOS traffic lights (red, yellow, green), search bar with 10px rounded corners, 4 segmented tabs (Chats with unread blue badge count, Contacts, Discover, Requests), and an active conversation list with contact avatars, online indicators, timestamps, and message previews.
2. Center Chat Panel (Flex-1): Recipient header with avatar, name, online status, phone, video call, and info action buttons. Message feed featuring Apple blue gradient outgoing bubbles (right-aligned with tail) with 2 blue read-receipt ticks, and light gray incoming bubbles (left-aligned with tail). Include an inline audio player card with waveform scrubber and a progressive media photo preview card. Bottom pill-shaped input bar with attachment '+' button, emoji icon, and accent send button.
3. Right Details Panel (300px): Profile avatar (80px), name, bio, shared photos 3x3 grid, and theme customization palette (6 accent color swatches).
Use Apple SF Pro typography, authentic iMessage colors (#007aff blue, #34c759 green, #e9e9eb gray), and clean, minimalist spacing.
```

### Stitch Prompt: Mobile iMessage Responsive Screen
```text
Design a mobile iOS 18 style iMessage chat screen (390px width x 844px height):
Top iOS Navigation Bar with '< Chats' back pill button, contact avatar, contact name 'Sarah Jenkins', and FaceTime video action icon.
Middle Chat Scroll Canvas containing sent iMessage bubbles in electric blue with timestamps and double blue ticks, incoming gray bubbles, and an image attachment card with download button overlay.
Bottom Floating iOS iMessage keyboard bar with '+' app drawer icon, rounded pill text field with placeholder 'iMessage', audio record wave icon, and blue send arrow.
Glassmorphic background with subtle ambient wallpaper gradient.
```

---

## 7. Code-to-Design Mapping Table

| UI Frame / Component | Figma Visual Asset | React Source File | CSS / Tailwind Anchor | Primary Props & Store State |
| :--- | :--- | :--- | :--- | :--- |
| **Main Window (Light)** | [`figma-images/main.png`](file:///d:/Work%20Space/iMessage/figma-images/main.png) | [`frontend/src/pages/Home.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/pages/Home.tsx) | `.imessage-window`, `.imessage-container` | `activeChatId`, `showDetails` |
| **Main Window (Dark)** | [`figma-images/main-screen-dark.png`](file:///d:/Work%20Space/iMessage/figma-images/main-screen-dark.png) | [`frontend/src/pages/Home.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/pages/Home.tsx) | `.dark .imessage-window` | `theme`, `setTheme` |
| **Sidebar Navigation** | [`figma-images/main.png`](file:///d:/Work%20Space/iMessage/figma-images/main.png) | [`frontend/src/components/Sidebar.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/Sidebar.tsx) | `.imessage-sidebar`, `.sidebar-header` | `conversations`, `friendRequests`, `friends` |
| **Conversation Row** | [`figma-images/main.png`](file:///d:/Work%20Space/iMessage/figma-images/main.png) | [`frontend/src/components/ConversationItem.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/ConversationItem.tsx) | `.conversation-item`, `.unread-badge` | `conversation`, `isActive`, `isTyping` |
| **Chat Thread Canvas** | [`figma-images/main.png`](file:///d:/Work%20Space/iMessage/figma-images/main.png) | [`frontend/src/components/ChatPanel.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/ChatPanel.tsx) | `.imessage-chat-pane`, `.messages-viewport` | `messages`, `sendMessage`, `isTyping` |
| **Progressive Media** | [`figma-images/main.png`](file:///d:/Work%20Space/iMessage/figma-images/main.png) | [`frontend/src/components/media/ProgressiveMedia.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/media/ProgressiveMedia.tsx) | `.progressive-media-container` | `mediaUrl`, `mediaType`, `status` |
| **Audio Player Bubble**| [`figma-images/main.png`](file:///d:/Work%20Space/iMessage/figma-images/main.png) | [`frontend/src/components/media/AudioPlayer.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/media/AudioPlayer.tsx) | `.audio-player-wrapper` | `src`, `duration`, `isPlaying` |
| **Desktop Media Lightbox**| [`figma-images/lightbox.png`](file:///d:/Work%20Space/iMessage/figma-images/lightbox.png) | [`frontend/src/components/media/MediaViewerModal.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/media/MediaViewerModal.tsx) | `.media-modal-backdrop` | `mediaUrl`, `isOpen`, `onClose` |
| **Details & Settings** | [`figma-images/setting.png`](file:///d:/Work%20Space/iMessage/figma-images/setting.png) | [`frontend/src/components/DetailsPanel.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/DetailsPanel.tsx) | `.imessage-details` | `activeChat`, `onClose` |
| **Theme & Accent Pickers**| [`figma-images/setting.png`](file:///d:/Work%20Space/iMessage/figma-images/setting.png) | [`frontend/src/components/accent-toggle.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/accent-toggle.tsx) | `.accent-picker` | `accentColor`, `setAccentColor` |
| **Auth Screen** | [`figma-images/auth.png`](file:///d:/Work%20Space/iMessage/figma-images/auth.png) | [`frontend/src/components/auth/AuthPanel.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/auth/AuthPanel.tsx) | `.auth-container`, `.auth-card` | Clerk `<SignIn />`, `<SignUp />` |
| **Privacy Lock Screen** | [`figma-images/lock-screen.png`](file:///d:/Work%20Space/iMessage/figma-images/lock-screen.png) | [`frontend/src/components/LockScreen.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/LockScreen.tsx) | `.lockscreen-overlay` | `isLocked`, `unlockPasscode` |
| **Mobile Chat (Light)**| [`figma-images/mobile-chat.png`](file:///d:/Work%20Space/iMessage/figma-images/mobile-chat.png) | [`frontend/src/pages/Home.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/pages/Home.tsx) | `.mobile-chat-view` | `activeChatId`, `onBack` |
| **Mobile Chat (Dark)** | [`figma-images/mobile-chat-dark.png`](file:///d:/Work%20Space/iMessage/figma-images/mobile-chat-dark.png) | [`frontend/src/pages/Home.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/pages/Home.tsx) | `.dark .mobile-chat-view` | `theme === "dark"` |
| **Mobile Lightbox** | [`figma-images/mobile-lightbox.png`](file:///d:/Work%20Space/iMessage/figma-images/mobile-lightbox.png) | [`frontend/src/components/media/MediaViewerModal.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/media/MediaViewerModal.tsx) | `.media-modal-backdrop` | `isFullscreen` |
| **Mobile Settings** | [`figma-images/mobile-setting.png`](file:///d:/Work%20Space/iMessage/figma-images/mobile-setting.png) | [`frontend/src/components/DetailsPanel.tsx`](file:///d:/Work%20Space/iMessage/frontend/src/components/DetailsPanel.tsx) | `.imessage-details-panel` | `showDetails` |

---

## 8. End-to-End Encryption (E2EE) Cryptographic Architecture

### 8.1 Zero-Knowledge Threat & Trust Model
The backend server and database operate as **untrusted, zero-knowledge relays**. Only communicating endpoints possess private cryptographic keys required to encrypt and decrypt payloads.

```
+------------------------------------+             +------------------------------------+
|          CLIENT A (Alice)          |             |          BACKEND SERVER & DB       |
|  - IndexedDB: Private Keys         |             |  - Zero-Knowledge Relay            |
|  - Web Crypto: ECDH / AES-256-GCM  |             |  - OPK Prekey Pool Dispenser       |
+------------------------------------+             +------------------------------------+
                  │                                                  │
                  │ 1. Fetch Bob Prekey Bundle                       │
                  │─────────────────────────────────────────────────>│
                  │ 2. Return Bob {IK_pub, SPK_pub, OPK_pub}         │
                  │<─────────────────────────────────────────────────│
                  │                                                  │
                  │ 3. Compute X3DH Master Secret & Encrypt Message  │
                  │ 4. Send Envelope {Ciphertext, IV, RatchetHeader} │
                  │─────────────────────────────────────────────────>│
                  │                                                  │ 5. Relay Envelope
                  │                                                  │───> Client B (Bob)
```

### 8.2 Client-Side Key Hierarchy & Web Crypto Primitives
- **Elliptic Curve Cryptography**: `ECDH` (P-256 / X25519) via Web Cryptography API (`crypto.subtle`).
- **Key Derivation (KDF)**: `HKDF-SHA256` for deriving master session and per-message symmetric keys.
- **Symmetric Cipher**: `AES-256-GCM` with unique 96-bit IVs and 128-bit authentication tags.
- **Secure Key Isolation**: Client private keys and active ratchet session states are persisted strictly in browser `IndexedDB` (`imessage_e2ee_keystore`), completely isolated from `localStorage` and cookies.

### 8.3 Asynchronous Key Agreement (X3DH Protocol)
When Alice messages Bob (even if Bob is offline):
1. Alice requests Bob's public prekey bundle from `/api/e2ee/prekeys/:userId`.
2. The server returns Bob's Identity Key (`IK`), Signed Prekey (`SPK`), and single-use One-Time Prekey (`OPK`), atomically marking that OPK as consumed.
3. Alice performs 4 Diffie-Hellman operations ($DH_1..DH_4$) and derives the shared master secret via `HKDF-SHA256`.

### 8.4 Message Ratcheting & Forward Secrecy
- **Per-Message KDF Ratchet**: Every message sent or received advances the symmetric ratchet chain, deriving a single-use message key and immediately wiping previous keys from client memory.
- **Tombstone Deletions**: Deleting a message clears the local ciphertext and notifies peers via WebSocket tombstone events (`message:deleted`).

### 8.5 Progressive Media Out-of-Band Encryption
1. Files are encrypted client-side using `AES-256-GCM` with a random 256-bit media key and IV.
2. The encrypted binary blob is uploaded directly to cloud media storage (ImageKit/CDN).
3. The media key, IV, and SHA-256 integrity hash are encrypted via the Double Ratchet envelope and sent through the E2EE messaging channel.
4. The receiver downloads the encrypted blob and decrypts it locally in the browser.

### 8.6 MITM Prevention (60-Digit Safety Numbers)
- **Deterministic Fingerprint**: Sorted hash of both parties' identity public keys:
  $$\text{SafetyNumber} = \text{SHA-512}(\text{Sort}(IK_{A,\text{pub}}, IK_{B,\text{pub}}))$$
- Formatted into 12 blocks of 5-digit numbers (e.g. `38491-92841-10294-...`) for in-person or out-of-band verification.

---

*Document maintained for iMessage Web engineering, Stitch AI generations, and Figma UI/UX design libraries.*



