# Stacked Pages Performance Tips

## Performance Optimizations Implemented

### 1. **Immediate Visual Feedback**
- Loading skeleton appears instantly when you click a link
- No waiting for content to start seeing feedback

### 2. **Optimized Content Loading**
- Uses `innerHTML` instead of `DOMParser` for faster parsing
- Only extracts the necessary content (`main.content`)
- 10-second timeout to prevent hanging

### 3. **Smart Caching**
- First load: Fetches from server
- Subsequent opens: Instant from cache
- LRU cache (max 20 pages) to limit memory usage

### 4. **Optimized Script Re-initialization**
- Only re-initializes Lucide icons in the new stack
- Only re-attaches Alpine.js if x-data elements are present
- Prevents duplicate event listeners with data attributes

### 5. **Console Logging**
You can see performance metrics in the browser console:
- "Fetch [url]" - Time to download HTML
- "Parse [url]" - Time to extract content
- "Using cached content" - When cache is used

## Checking Performance

### Open Browser DevTools
1. Open http://localhost:8081/
2. Press F12 (or Cmd+Option+I on Mac)
3. Go to Console tab
4. Click an internal link

You should see:
```
Opening page: /notes/some-page/
Fetch /notes/some-page/: 50ms
Parse /notes/some-page/: 5ms
Successfully loaded: /notes/some-page/
```

### Expected Times
- **First load**: 50-200ms (depends on page size and network)
- **Cached load**: <5ms (instant)
- **Skeleton appears**: <16ms (one frame)

### If It's Still Slow

#### Check Network Tab
1. DevTools → Network tab
2. Click a link
3. Look for the request to the page
4. Check "Time" column

**Possible Issues:**
- **Large page size** → Pages with lots of images/content take longer
- **Slow server** → Development server may be slow on first request
- **Too many scripts** → Pages loading external resources

#### Browser Cache
Your browser may be caching the old version:
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear cache: DevTools → Application → Clear Storage

## Further Optimizations (Optional)

### 1. Reduce Page Size
The static HTML pages might be large. Check file sizes:
```bash
ls -lh dist/aion/**/*.html
```

### 2. Enable Compression
If deploying, enable gzip/brotli compression on your server.

### 3. Lazy Load Images
Add loading="lazy" to images in your notes.

### 4. Prefetch Links on Hover
Could add link prefetching on hover (loads before click):
```javascript
link.addEventListener('mouseenter', () => {
    window.StackedPagesManager.loadPageContent(url); // Preload
});
```

## Debugging Slow Loads

If a specific page is slow, check:

1. **Page content** - Does it have heavy scripts or large images?
2. **Console errors** - Any JavaScript errors blocking rendering?
3. **Network waterfall** - DevTools → Network → Waterfall view

## Current Status

✅ Loading skeleton for instant feedback
✅ Optimized fetch and parse
✅ Smart caching (LRU)
✅ Console timing logs
✅ Timeout protection
✅ Optimized script re-initialization

The system should feel fast now. If you're still experiencing slowness:
1. Check the browser console for timing logs
2. Check the Network tab for actual download times
3. Try a hard refresh (Cmd+Shift+R)
4. Let me know which specific pages are slow
