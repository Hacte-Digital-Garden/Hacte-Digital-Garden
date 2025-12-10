# Stacked Pages Implementation Plan

## Overview
Transform the Hacte Digital Garden from traditional full-page navigation to a horizontally stacked pages system similar to Vlad's Roam Garden, where clicking internal links opens new notes side-by-side instead of replacing the current page.

## Current Architecture Analysis

### Existing System
- **Framework**: Eleventy 3.1.2 (static site generator)
- **Templates**: Nunjucks (.njk files)
- **JavaScript**: Alpine.js 3.11.1 for state management
- **Navigation**: Traditional full-page loads via standard `<a>` tags
- **Link Preview**: Already loads content via hidden iframe (linkPreview.njk)
- **Styling**: SCSS with custom green/mint theme (#C1FDE6)

### Key Navigation Entry Points to Modify
1. Internal links (`.internal-link` class) in note content
2. Graph visualization clicks (`graphScript.njk` line 131-133)
3. Search result clicks (`searchScript.njk`)
4. Backlink clicks in sidebar
5. File tree navigation clicks

## Implementation Approach

### Choice: Hybrid Static + Client-Side SPA Approach

**Rationale:**
- Preserves existing Eleventy build system and SEO benefits
- Leverages existing iframe-based content loading pattern from link preview
- Works with Alpine.js state management already in use
- No need to rebuild entire architecture or add heavy frameworks like React/Vue

### Architecture: Three-Layer System

#### Layer 1: Page Container Manager (Alpine.js Component)
- Manages array of open page stacks
- Handles add/remove/navigate operations
- Maintains scroll position and active state
- Syncs with browser history API

#### Layer 2: Content Loader (Enhanced from linkPreview.njk)
- Fetches page HTML via fetch API or iframe technique
- Extracts note content, title, metadata
- Caches loaded content for performance
- Handles failed loads gracefully

#### Layer 3: UI Layout (CSS Grid/Flexbox)
- Horizontal container with fixed-width columns (~625px like Vlad's)
- Sticky headers per page
- Smooth transitions and shadows
- Responsive: stacked on desktop (>800px), single on mobile

## Detailed Implementation Steps

### Step 1: Create Stacked Pages Container Component
**File to create:** `src/site/_includes/components/stackedPages.njk`

**Responsibilities:**
- Alpine.js reactive component managing `pages` array
- Each page object contains: `{ url, title, content, scrollTop, isActive }`
- Methods: `openPage(url)`, `closePage(index)`, `setActivePage(index)`
- Browser history integration (pushState/replaceState)
- Restore state from URL parameters or sessionStorage

**Key Features:**
- Maximum 5 pages open simultaneously (configurable)
- Auto-scroll to newly opened pages
- Keyboard navigation (arrow keys to switch between pages)

### Step 2: Intercept Navigation Events
**File to create:** `src/site/_includes/components/navigationInterceptor.njk`

**Responsibilities:**
- Event delegation on `document` for click events
- Intercept clicks on:
  - `.internal-link` elements
  - Backlink cards (`.backlink-card a`)
  - Graph nodes (modify `onNodeClick` handler)
  - Search results (modify search result click handler)
- Prevent default navigation
- Call `openPage(url)` instead

**Special Handling:**
- External links: allow default behavior
- Modifier keys (Cmd/Ctrl+Click): open in new browser tab
- Hash links on same page: scroll within current stack

### Step 3: Content Loading System
**File to create:** `src/site/_includes/components/contentLoader.njk`

**Approach:** Enhanced fetch-based loading (better than iframe for this use case)

**Process:**
1. Fetch page HTML via `fetch(url)`
2. Parse HTML into DOM using `DOMParser`
3. Extract relevant parts:
   - Title from `h1` or `<title>` tag
   - Main content from `.content` element
   - Tags from `.header-tags`
   - Metadata (timestamps, etc.)
4. Re-initialize necessary scripts (Lucide icons, etc.)
5. Cache in memory (Map with URL as key)

**Cache Strategy:**
- Store parsed HTML in `contentCache` Map
- Max 20 cached pages, LRU eviction
- Clear cache on full page reload only

### Step 4: CSS Layout System
**File to modify:** `src/site/styles/custom-style.scss`

**New Styles:**
```scss
#stacked-pages-container {
  display: flex;
  flex-direction: row;
  position: fixed;
  top: 0;
  left: 250px; // Account for filetree sidebar
  right: 0;
  bottom: 0;
  overflow-x: auto;
  scroll-behavior: smooth;

  @media (max-width: 800px) {
    left: 0;
    flex-direction: column;
    overflow-x: hidden;
  }
}

.note-stack {
  flex-shrink: 0;
  width: 625px;
  max-width: 625px;
  height: 100vh;
  position: sticky;
  left: 0;
  background: rgba(#C1FDE6, 0.9);
  border-right: 1px solid rgba(#1d1d1d, 0.4);
  overflow-y: auto;
  transition: box-shadow 75ms cubic-bezier(.19,1,.22,1);

  &:hover {
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
  }

  &.is-active {
    z-index: 10;
  }

  &.is-obstructed {
    .obstructed-label {
      opacity: 1;
    }
  }

  @media (max-width: 800px) {
    width: 100%;
    max-width: 100%;
    height: 100vh;
    position: relative;
  }
}

.close-note-button {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  cursor: pointer;
  background: rgba(29, 29, 29, 0.8);
  color: #C1FDE6;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 200ms;

  .note-stack:hover & {
    opacity: 1;
  }
}

.obstructed-label {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%) rotate(-90deg);
  transform-origin: left center;
  background: rgba(29, 29, 29, 0.8);
  color: #C1FDE6;
  padding: 8px 16px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 200ms;
  pointer-events: none;
}
```

**Modifications to Existing Styles:**
- Hide/adapt original `.content` wrapper (currently centered)
- Adjust sidebar positioning (move to fixed right edge or per-stack)
- Filetree sidebar stays on left, fixed

### Step 5: Sidebar Handling Strategy

**Challenge:** Current sidebar shows backlinks/TOC/graph for ONE page only

**Solutions (Choose One):**

**Option A: Shared Global Sidebar (Simpler)**
- Sidebar updates to show info for currently active/hovered stack
- Remains in fixed position on right edge
- Use Alpine reactivity to update when `activePageIndex` changes
- Pros: Less complex, familiar pattern
- Cons: Only one sidebar visible

**Option B: Per-Stack Sidebar (More Complex)**
- Each note stack has its own mini-sidebar
- Collapsible/expandable to save space
- Pros: More information density, closer to Obsidian UX
- Cons: More complex layout, potential performance issues

**Recommendation: Option A for initial implementation**

### Step 6: Browser History Integration
**File to modify:** `src/site/_includes/components/stackedPages.njk`

**Strategy:**
- Use `history.pushState()` when opening new page
- Store stack state in URL hash or query params
- Example: `#stacks=/page1,/page2,/page3`
- Handle `popstate` event for back/forward buttons
- Restore full stack on page load from URL

**Edge Cases:**
- Direct navigation to deep links (restore single page)
- Shared URLs with stacks (graceful degradation)
- Mobile vs desktop differences

### Step 7: Mobile Responsive Behavior
**Strategy:**
- Desktop (>800px): Horizontal stacking with scroll
- Mobile (≤800px): Vertical single-page with navigation controls
- Show stack navigation controls (prev/next arrows)
- Swipe gestures to navigate between stacked pages
- Close button more prominent on mobile

### Step 8: Performance Optimizations
- Lazy load page content (only fetch when opened)
- Virtualization for >5 stacks (hide off-screen stacks from DOM)
- Debounce scroll events
- CSS `contain` property for layout performance
- Intersection Observer for obstructed labels

### Step 9: Integration Points

**Modify these existing files:**
1. `src/site/_includes/layouts/note.njk` - Wrap in stacked container
2. `src/site/_includes/components/graphScript.njk` - Change `window.location` to `openPage()`
3. `src/site/_includes/components/searchScript.njk` - Intercept result clicks
4. `src/site/_includes/components/sidebar.njk` - Make reactive to active page
5. `src/site/styles/custom-style.scss` - Add stacking styles

**New files to create:**
1. `src/site/_includes/components/stackedPages.njk` - Main container
2. `src/site/_includes/components/navigationInterceptor.njk` - Click handler
3. `src/site/_includes/components/contentLoader.njk` - Fetch/parse logic
4. `src/site/styles/stacked-pages.scss` - Dedicated styles (imported in custom-style.scss)

## User Settings & Configuration

Add to `src/site/_data/meta.js` or create new settings file:
```javascript
stackedPagesSettings: {
  enabled: true,              // Feature flag
  maxStacks: 5,              // Maximum simultaneous pages
  stackWidth: 625,           // Width per stack in pixels
  enableMobile: false,       // Enable stacking on mobile
  animationSpeed: 200,       // Transition duration in ms
  persistState: true,        // Save to sessionStorage
  historyIntegration: true   // Use browser history API
}
```

## Testing Checklist

- [ ] Open note from internal link creates new stack
- [ ] Graph node click opens in stack
- [ ] Search result opens in stack
- [ ] Backlink click opens in stack
- [ ] File tree click opens in stack
- [ ] Close button removes specific stack
- [ ] Maximum stack limit enforced
- [ ] Scroll position maintained per stack
- [ ] Active stack highlighted properly
- [ ] Sidebar updates for active stack
- [ ] Browser back/forward works correctly
- [ ] URL contains stack state
- [ ] Refresh restores stack from URL
- [ ] Mobile shows single page only
- [ ] External links open normally
- [ ] Cmd/Ctrl+Click opens new tab
- [ ] Hash links scroll within stack
- [ ] Performance with 5+ stacks
- [ ] Cache eviction works
- [ ] Link preview tooltip still works (or disabled in stacked mode)

## Migration & Rollout Plan

### Phase 1: Feature Flag Development
- Implement behind `stackedPagesSettings.enabled = false`
- Test thoroughly without affecting production
- Allow opt-in testing

### Phase 2: Default On with Escape Hatch
- Enable by default
- Provide clear UI toggle or setting to revert
- Monitor for issues

### Phase 3: Deprecate Old Navigation
- Remove feature flag after stable period
- Clean up old navigation code

## Potential Issues & Mitigations

### Issue 1: Scripts Not Re-Initializing
**Problem:** Alpine.js, Lucide icons, etc. not working in dynamically loaded content
**Solution:**
- Call `Alpine.initTree()` on new content
- Re-run `lucide.createIcons()` for each stack
- Use event delegation where possible

### Issue 2: CSS Conflicts
**Problem:** Global styles affecting stacked layout unexpectedly
**Solution:**
- Use BEM naming for new components
- Scope stack-specific styles
- Test extensively across pages

### Issue 3: Memory Leaks
**Problem:** Event listeners and cached content accumulating
**Solution:**
- Properly clean up when closing stacks
- Limit cache size with LRU eviction
- Use AbortController for fetch requests

### Issue 4: SEO Impact
**Problem:** Client-side navigation might hurt SEO
**Solution:**
- Keep server-side rendering intact
- Progressive enhancement approach
- Ensure crawlers see static HTML

### Issue 5: Accessibility
**Problem:** Screen readers and keyboard navigation
**Solution:**
- ARIA labels for stacks and controls
- Focus management when opening/closing
- Keyboard shortcuts documented
- Skip links to jump between stacks

## Alternative Approaches Considered

### Alternative 1: Full React/Vue SPA Rewrite
**Pros:** Modern, well-supported patterns
**Cons:** Complete rebuild, loses Eleventy SSG benefits, overkill for static site

### Alternative 2: Iframe-Based Stacking
**Pros:** True isolation, simpler content loading
**Cons:** Performance overhead, cross-origin issues, difficult state sharing

### Alternative 3: Server-Side Rendering of Stacks
**Pros:** No JavaScript required
**Cons:** Can't work with static hosting, requires backend, poor UX

**Chosen approach (Hybrid) balances:**
- Preserving existing architecture
- Minimizing complexity
- Maintaining performance
- Progressive enhancement

## Timeline Estimate

- **Research & Planning**: ✅ Complete
- **Step 1-3 (Core System)**: 3-4 hours
- **Step 4-5 (Layout & Sidebar)**: 2-3 hours
- **Step 6-7 (History & Mobile)**: 2-3 hours
- **Step 8-9 (Optimization & Integration)**: 2-3 hours
- **Testing & Refinement**: 2-3 hours
- **Total**: ~12-16 hours of development

## Success Criteria

✅ Users can click internal links and see stacked pages side-by-side
✅ Maximum of 5 pages stack horizontally with smooth scrolling
✅ Each stack has close button and visual feedback
✅ Works across all navigation entry points
✅ Mobile users see single-page view
✅ Browser back/forward buttons work correctly
✅ Performance remains acceptable with multiple stacks
✅ Existing features (search, graph, etc.) continue to work
✅ Accessible via keyboard and screen readers
