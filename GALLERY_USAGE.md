# Gallery Component Usage Guide

The gallery component is now organized and reusable across the site.

## Files Organization

- **CSS**: `src/site/styles/custom-style.scss` (gallery styles at the bottom)
- **JavaScript**: `src/site/scripts/gallery.js` (lightbox functionality)
- **Component template**: `src/site/_includes/components/gallery.njk` (optional, for Nunjucks pages)

## How to Use in Markdown Files

Since markdown files pass through HTML natively, you can add a gallery by pasting this HTML:

```html
<div class="gallery-grid">
  <img src="path/to/image-01.jpg" alt="Description 1" onclick="openLightbox(0)">
  <img src="path/to/image-02.jpg" alt="Description 2" onclick="openLightbox(1)">
  <img src="path/to/image-03.jpg" alt="Description 3" onclick="openLightbox(2)">
  <!-- Add more images as needed -->
</div>

<div id="lightbox" class="lightbox" onclick="closeLightbox()">
  <span class="lightbox-close">&times;</span>
  <span class="lightbox-prev" onclick="event.stopPropagation(); changeImage(-1)">&#10094;</span>
  <img id="lightbox-img" class="lightbox-content" src="" alt="">
  <span class="lightbox-next" onclick="event.stopPropagation(); changeImage(1)">&#10095;</span>
</div>

<script>
  initGallery([
    'path/to/image-01.jpg',
    'path/to/image-02.jpg',
    'path/to/image-03.jpg'
  ]);
</script>
```

## Important Notes

1. **Image paths**: Adjust relative paths (`../../../img/`) based on your page location
2. **Index numbers**: In `onclick="openLightbox(INDEX)"`, start from 0 and increment
3. **Script array**: The `initGallery()` array must match the order of images in the grid
4. **One lightbox**: Only include one `<div id="lightbox">` per page (it's reused for all images)

## Features

- Click any image to open in lightbox
- Navigate with arrow buttons or keyboard (← →)
- Close with X button or Escape key
- Responsive grid layout
- Hover effects on thumbnails

## Example

See `src/site/notes/AION/Procés 2025/gabinet.md` for a working example with 19 images.
