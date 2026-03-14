import PhotoSwipe from "photoswipe";

interface GalleryImage extends PhotoSwipe.Item {
  t?: string;
  title: string,
  f: string;
  b: string;
  o: { w: number, h: number };
  m: { w: number, h: number };
  s: { w: number, h: number };
}

// bilder.json is inlined in bilder shortcode as window.galleries
declare global {
  interface Window {
    galleries: { [year: string]: { [title: string]: GalleryImage[] } };
  }
}

export class Gallery {
  private static galleries: { [year: string]: { [title: string]: GalleryImage[] } };

  public static openGallery(galleryContainer: HTMLElement): void {
    const previewImg = galleryContainer.querySelector<HTMLImageElement>(".preview");
    if (!previewImg) return;

    const year = previewImg.dataset.year;
    const galleryTitle = previewImg.dataset.gallery;

    if (!year || !galleryTitle) return;

    const items = Gallery.galleries[year]?.[galleryTitle] || [];
    if (items.length === 0) return;

    // Determine image size based on viewport
    const realViewportWidth = window.innerWidth * window.devicePixelRatio;
    const useLargeImages = realViewportWidth >= 750;

    // Map items to PhotoSwipe format with correct image sources
    // Originals are at: /gallery/{b}{f}  (e.g. /gallery/2017/001/00000.jpg)
    // Medium at:        /gallery/{b}m/{f} (e.g. /gallery/2017/001/m/00000.jpg)
    const psItems = items.map(item => ({
      src: useLargeImages ? `/gallery/${item.b}${item.f}` : `/gallery/${item.b}m/${item.f}`,
      width: useLargeImages ? item.o.w : item.m.w,
      height: useLargeImages ? item.o.h : item.m.h,
      title: item.t || item.title,
      msrc: `/gallery/${item.b}m/${item.f}`,
    }));

    // PhotoSwipe v5: dataSource must be a plain array, not { items: [] }
    const pswp = new PhotoSwipe({
      dataSource: psItems as any,
      index: 0,
      wheelToZoom: true,
      preloaderDelay: 0,
    } as PhotoSwipe.Options);
    pswp.init();
  }

  private static shufflePreview(): void {
    const allPreviews = Array.from(document.querySelectorAll<HTMLImageElement>(".preview"));
    const visiblePreviews = allPreviews.filter(p => {
      const style = window.getComputedStyle(p);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    if (visiblePreviews.length === 0) {
      setTimeout(() => Gallery.shufflePreview(), 10000);
      return;
    }

    const randomPreview = visiblePreviews[Math.floor(Math.random() * visiblePreviews.length)];
    const year = randomPreview.dataset.year;
    const galleryTitle = randomPreview.dataset.gallery;

    if (!year || !galleryTitle) {
      setTimeout(() => Gallery.shufflePreview(), 10000);
      return;
    }

    const items = Gallery.galleries[year]?.[galleryTitle];
    if (!items || items.length === 0) {
      setTimeout(() => Gallery.shufflePreview(), 10000);
      return;
    }

    const smallImages = items.filter((i: GalleryImage) => i.s.w === 200);
    const imageList = smallImages.length > 0 ? smallImages : items;
    const randomImage = imageList[Math.floor(Math.random() * imageList.length)];

    randomPreview.style.opacity = "0";
    randomPreview.style.transition = "opacity 0.4s ease";

    setTimeout(() => {
      randomPreview.src = `/gallery/${randomImage.b}m/${randomImage.f}`;
      randomPreview.style.opacity = "1";
    }, 400);

    setTimeout(() => Gallery.shufflePreview(), 10000);
  }

  public static initialize(): void {
    Gallery.galleries = window.galleries;

    // Add click handlers to gallery containers
    const galleryContainers = document.querySelectorAll<HTMLElement>(".mvw-gallery");
    galleryContainers.forEach(gallery => {
      gallery.addEventListener("click", (e) => {
        e.preventDefault();
        Gallery.openGallery(gallery);
      });
    });

    Gallery.shufflePreview();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  Gallery.initialize();
});











