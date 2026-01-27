// Gallery lightbox functionality
(function() {
  let currentImageIndex = 0;
  let images = [];

  window.initGallery = function(imageArray) {
    images = imageArray;
  };

  window.openLightbox = function(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (lightbox && lightboxImg) {
      lightbox.classList.add('active');
      lightboxImg.src = images[currentImageIndex];
    }
  };

  window.closeLightbox = function() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.classList.remove('active');
    }
  };

  window.changeImage = function(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = images.length - 1;
    if (currentImageIndex >= images.length) currentImageIndex = 0;

    const lightboxImg = document.getElementById('lightbox-img');
    if (lightboxImg) {
      lightboxImg.src = images[currentImageIndex];
    }
  };

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') changeImage(-1);
      if (e.key === 'ArrowRight') changeImage(1);
    }
  });
})();
