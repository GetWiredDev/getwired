---
name: getwired-app
description: Navigate, test, and interact with the GetWired.dev community platform. Use when testing app features, finding bugs, verifying UI flows, or extracting data from GetWired.
metadata: {"openclaw":{"emoji":"⚡","os":["darwin","linux","win32"],"requires":{"config":["browser.enabled"]}}}
---

# GetWired.dev — App Navigation & Testing Skill

## Overview

GetWired.dev is a Next.js tech community platform with Convex backend. It features forums, real-time chat, news aggregation, user profiles, notifications, bookmarks, polls, events, and a marketplace. The app runs in dark mode with a desktop-style UI.

**Base URL:** `http://localhost:3000` (development) or `https://getwired.dev` (production)

## App Structure & Routes

| Route | Page | Key data-testid |
|-------|------|-----------------|
| `/` | Home feed (Hot/New/Following/Trending tabs) | `home-page`, `main-content`, `feed-list` |
| `/forums` | Forums listing by category | — |
| `/forums/[category]` | Posts in a category | — |
| `/forums/[category]/[postId]` | Post detail with comments | — |
| `/chat` | Chat rooms list | — |
| `/chat/[roomId]` | Chat room with messages | `message-input-area`, `chat-message-input`, `chat-send-button` |
| `/news` | News feed from RSS sources | — |
| `/discover` | Trending topics, leaderboard, events | — |
| `/search` | Global search (posts, users, news) | `search-bar`, `search-input` |
| `/profile/[userId]` | User profile | — |
| `/profile/edit` | Edit profile | — |
| `/bookmarks` | User's saved items | — |
| `/notifications` | All notifications | — |
| `/newsletter` | Newsletter signup | — |
| `/marketplace` | Ads & promotions | — |
| `/admin` | Admin dashboard | — |

## Navigation

### Top Navbar (`data-testid="navbar"`)
- **Logo:** `data-testid="navbar-logo"` → links to `/`
- **Nav links:** `data-testid="nav-link-home"`, `nav-link-forums"`, `nav-link-news"`, `nav-link-chat"`, `nav-link-discover"`
- **Search button:** `data-testid="nav-search-button"` → goes to `/search`
- **Notifications:** `data-testid="notification-bell"` → opens notification popover (`data-testid="notification-panel"`)
- **User menu:** `data-testid="user-menu-trigger"` → dropdown with Profile, Bookmarks, Settings, Sign Out
- **Sign in:** `data-testid="sign-in-button"` (when not authenticated)

### Left Sidebar (`data-testid="sidebar"`)
- **Categories:** `data-testid="sidebar-categories"` — links like `sidebar-category-web-dev`, `sidebar-category-systems`, etc.
- **Trending tags:** `data-testid="sidebar-trending-tags"` — tag links like `sidebar-tag-rust`, `sidebar-tag-nextjs`
- **Quick links:** `data-testid="sidebar-quick-links"` — About, Newsletter, Amplify

### Right Sidebar (`data-testid="right-sidebar"`)
- **Trending tags panel:** `data-testid="trending-tags-panel"`
- **Upcoming events:** `data-testid="upcoming-events-panel"`
- **Who to follow:** `data-testid="who-to-follow-panel"`

## Key Interactive Elements

### Creating a Post
1. Click `data-testid="post-composer-trigger"` ("What's on your mind?")
2. Form expands → `data-testid="post-composer-form"`
3. Type content in `data-testid="post-composer-content"`
4. Optionally add tags (type + Enter/comma)
5. Click `data-testid="post-composer-submit"` to submit

### Interacting with Posts
Each post card: `data-testid="post-card"`
- **Like:** `data-testid="post-like-button"` (aria-pressed shows state)
- **Like count:** `data-testid="post-like-count"`
- **Comments link:** `data-testid="post-comments-link"`
- **Comment count:** `data-testid="post-comment-count"`
- **View count:** `data-testid="post-view-count"`
- **Bookmark:** `data-testid="post-bookmark-button"` (aria-pressed shows state)

### Chat
- **Message input:** `data-testid="chat-message-input"`
- **Send button:** `data-testid="chat-send-button"`
- Supports @mentions (type `@` to trigger autocomplete)
- Emoji picker available via smile icon

### Search
- **Search bar:** `data-testid="search-bar"` with `data-testid="search-input"`
- **Clear button:** `data-testid="search-clear"`
- Keyboard shortcut: `Cmd+K` / `Ctrl+K` to focus search
- Results include posts, users, and news articles

## Authentication

The app uses Clerk for authentication. In demo mode, a demo user is auto-signed-in.
- When signed out, `data-testid="sign-in-button"` appears in the navbar
- When signed in, `data-testid="user-menu-trigger"` shows the user avatar

## Tech Stack

- **Frontend:** Next.js 15, React, Tailwind CSS, shadcn/ui, Lucide icons
- **Backend:** Convex (real-time database + serverless functions)
- **Auth:** Clerk
- **State:** Convex queries for server state, React hooks for client state

## Testing Checklist

When testing GetWired, verify these flows:

1. **Navigation:** Click each nav link and verify pages load
2. **Feed tabs:** Switch between Hot/New/Following/Trending on home
3. **Post creation:** Create a post with content and tags
4. **Post interactions:** Like, bookmark, and comment on posts
5. **Search:** Search for posts, users, and news
6. **Chat:** Send messages, try @mentions, use emoji picker
7. **Notifications:** Check notification bell, mark as read
8. **Profile:** View and edit user profile
9. **Forums:** Browse categories, view posts within categories
10. **Responsive:** Test mobile menu trigger on smaller viewports

## Browser Automation Tips

- Use `agent-browser snapshot -i` to see interactive elements
- Target elements by `data-testid` for stable selectors
- The app uses `aria-label` on key buttons for accessibility tree clarity
- Feed loads via infinite scroll — scroll down to trigger more posts
- Toast notifications appear via Sonner (bottom-right)
- The app is dark-mode only (`html.dark`)

## Data Model (Convex Tables)

Key tables: `users`, `posts`, `postLikes`, `comments`, `forumCategories`, `chatRooms`, `chatMessages`, `newsArticles`, `notifications`, `bookmarks`, `follows`, `polls`, `events`, `promotions`, `newsletterSubscribers`

## Common Selectors for Agent Navigation

```
# Navigate to pages
[data-testid="nav-link-forums"]     → Forums page
[data-testid="nav-link-chat"]       → Chat page
[data-testid="nav-link-news"]       → News page
[data-testid="nav-link-discover"]   → Discover page

# Create content
[data-testid="post-composer-trigger"]  → Open post composer
[data-testid="post-composer-content"]  → Type post content
[data-testid="post-composer-submit"]   → Submit post

# Interact with posts
[data-testid="post-like-button"]     → Like/unlike
[data-testid="post-bookmark-button"] → Bookmark/unbookmark

# Chat
[data-testid="chat-message-input"]   → Type message
[data-testid="chat-send-button"]     → Send message

# Search
[data-testid="search-input"]         → Type search query
```

