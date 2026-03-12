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
| `/forums` | Forums listing by category | `forums-page`, `forums-search-input`, `forums-category-grid`, `forum-category-{slug}` |
| `/forums/[category]` | Posts in a category | `category-feed-page`, `breadcrumb`, `category-sort-controls`, `sort-hot/new/comments`, `category-post-list`, `category-post-item`, `new-post-button` |
| `/forums/[category]/[postId]` | Post detail with comments | `post-detail-page`, `breadcrumb`, `post-detail`, `post-detail-like-button`, `post-detail-bookmark-button`, `post-detail-share-button`, `comments-section`, `comment-tree`, `comment-count`, `comment-sort-controls`, `related-posts` |
| `/chat` | Chat rooms list | `chat-page`, `chat-room-list`, `chat-room-search`, `chat-room-item` |
| `/chat/[roomId]` | Chat room with messages | `chat-room-page`, `chat-room`, `chat-room-header`, `chat-room-name`, `chat-messages-area`, `message-input-area`, `chat-message-input`, `chat-send-button` |
| `/news` | News feed from RSS sources | `news-page`, `news-feed`, `news-source-filters`, `news-sort-controls`, `news-card` |
| `/discover` | Trending topics, leaderboard, events | `discover-page`, `discover-content`, `discover-trending-tags`, `discover-leaderboard`, `event-card`, `event-rsvp-button`, `user-suggestion` |
| `/search` | Global search (posts, users, news) | `search-page`, `search-bar`, `search-input`, `search-tabs`, `search-tab-{value}` |
| `/profile/[userId]` | User profile | `profile-page`, `profile-header`, `profile-follow-button`, `profile-message-button`, `profile-tabs`, `profile-tab-overview/posts/comments/cv` |
| `/profile/edit` | Edit profile | `edit-profile-page`, `profile-save-button`, `profile-change-avatar`, `profile-input-name/username/bio/location` |
| `/bookmarks` | User's saved items | `bookmarks-page`, `bookmarks-tabs`, `bookmarks-tab-posts/news/users`, `bookmark-list`, `bookmark-item`, `bookmark-remove` |
| `/notifications` | All notifications | `notifications-page`, `notification-tabs`, `mark-all-read`, `notification-item` |
| `/newsletter` | Newsletter signup | `newsletter-page`, `newsletter-form`, `newsletter-email-input`, `newsletter-subscribe-button` |
| `/marketplace` | Ads & promotions | `marketplace-page`, `boost-section`, `advertise-section`, `premium-section` |
| `/admin` | Admin dashboard | `admin-page`, `admin-stats-grid` |

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
- **Room list:** `data-testid="chat-room-list"` with `data-testid="chat-room-search"` and `data-testid="chat-room-item"`
- **Room view:** `data-testid="chat-room"` with `data-testid="chat-room-header"`, `chat-room-name`, `chat-messages-area`
- **Message input:** `data-testid="chat-message-input"`
- **Send button:** `data-testid="chat-send-button"`
- Supports @mentions (type `@` to trigger autocomplete)
- Emoji picker available via smile icon

### Search
- **Search bar:** `data-testid="search-bar"` with `data-testid="search-input"`
- **Clear button:** `data-testid="search-clear"`
- **Tabs:** `data-testid="search-tabs"` with `search-tab-all`, `search-tab-posts`, `search-tab-users`, `search-tab-news`
- Keyboard shortcut: `Cmd+K` / `Ctrl+K` to focus search
- Results include posts, users, and news articles

### Comments (on post detail pages)
- **Comment tree:** `data-testid="comment-tree"` with `data-testid="comment-count"`
- **Sort controls:** `data-testid="comment-sort-controls"` with `comment-sort-best/new/old`
- **Comment nodes:** `data-testid="comment-node"` with `comment-like-button`, `comment-reply-button`
- **Comment composer:** `data-testid="comment-composer"` with `comment-textarea`, `comment-submit`

### Profile
- **Header:** `data-testid="profile-header"` with `profile-follow-button`, `profile-message-button`
- **Tabs:** `data-testid="profile-tabs"` with `profile-tab-overview/posts/comments/cv`
- **Edit form:** `data-testid="edit-profile-page"` with `profile-input-name/username/bio/location`, `profile-save-button`, `profile-change-avatar`

### Bookmarks
- **Tabs:** `data-testid="bookmarks-tabs"` with `bookmarks-tab-posts/news/users`
- **Items:** `data-testid="bookmark-list"` → `bookmark-item` → `bookmark-remove`

### Notifications
- **Tabs:** `data-testid="notification-tabs"` with `mark-all-read`
- **Items:** `data-testid="notification-item"`

### Newsletter
- **Form:** `data-testid="newsletter-form"` with `newsletter-email-input`, `newsletter-subscribe-button`

### Marketplace
- **Sections:** `data-testid="boost-section"`, `advertise-section`, `premium-section`

### News
- **Feed:** `data-testid="news-feed"` with `news-source-filters`, `news-sort-controls`
- **Cards:** `data-testid="news-card"`

### Discover
- **Trending tags:** `data-testid="discover-trending-tags"`
- **Leaderboard:** `data-testid="discover-leaderboard"`
- **Events:** `data-testid="event-card"` with `event-rsvp-button`
- **User suggestions:** `data-testid="user-suggestion"`

### Shared Components
- **Follow button:** `data-testid="follow-button"` (aria-pressed shows state)
- **Share button:** `data-testid="share-button"` → `share-menu` → `share-copy-link`
- **Poll:** `data-testid="poll"` with `poll-vote-button`
- **Tag list:** `data-testid="tag-list"`

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

# Interact with posts (feed cards)
[data-testid="post-like-button"]     → Like/unlike
[data-testid="post-bookmark-button"] → Bookmark/unbookmark

# Interact with posts (detail page)
[data-testid="post-detail-like-button"]     → Like/unlike
[data-testid="post-detail-bookmark-button"] → Bookmark/unbookmark
[data-testid="post-detail-share-button"]    → Share post

# Comments
[data-testid="comment-textarea"]     → Write a comment
[data-testid="comment-submit"]       → Submit comment
[data-testid="comment-like-button"]  → Like a comment
[data-testid="comment-reply-button"] → Reply to a comment

# Chat
[data-testid="chat-room-list"]       → Room list sidebar
[data-testid="chat-room-search"]     → Search rooms
[data-testid="chat-room-item"]       → Click to enter room
[data-testid="chat-message-input"]   → Type message
[data-testid="chat-send-button"]     → Send message

# Search
[data-testid="search-input"]         → Type search query
[data-testid="search-tab-posts"]     → Filter to posts
[data-testid="search-tab-users"]     → Filter to users
[data-testid="search-tab-news"]      → Filter to news

# Profile
[data-testid="profile-follow-button"]  → Follow/unfollow user
[data-testid="profile-message-button"] → Message user
[data-testid="follow-button"]          → Follow button (shared component)

# Forums
[data-testid="forums-search-input"]  → Search categories
[data-testid="forum-category-{slug}"] → Click a category
[data-testid="sort-hot"]             → Sort by hot
[data-testid="sort-new"]             → Sort by new

# Bookmarks
[data-testid="bookmark-remove"]      → Remove a bookmark

# Notifications
[data-testid="mark-all-read"]        → Mark all as read

# Newsletter
[data-testid="newsletter-email-input"]      → Enter email
[data-testid="newsletter-subscribe-button"] → Subscribe

# Events
[data-testid="event-rsvp-button"]    → RSVP to event

# Polls
[data-testid="poll-vote-button"]     → Submit vote
```

