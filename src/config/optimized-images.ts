export interface OptimizedImageVariant {
	src: string;
	width: number;
	bytes: number;
}

export interface OptimizedImage {
	width: number;
	height: number;
	webp: OptimizedImageVariant[];
	avif: OptimizedImageVariant[];
}

export const optimizedImages: Record<string, OptimizedImage> = {
  "/images/course-memorization.jpg": {
    "width": 612,
    "height": 405,
    "webp": [
      {
        "src": "/images/optimized/course-memorization-96.webp",
        "width": 96,
        "bytes": 2154
      },
      {
        "src": "/images/optimized/course-memorization-160.webp",
        "width": 160,
        "bytes": 3800
      },
      {
        "src": "/images/optimized/course-memorization-320.webp",
        "width": 320,
        "bytes": 9248
      },
      {
        "src": "/images/optimized/course-memorization-480.webp",
        "width": 480,
        "bytes": 17088
      },
      {
        "src": "/images/optimized/course-memorization-612.webp",
        "width": 612,
        "bytes": 21626
      }
    ],
    "avif": []
  },
  "/images/course-recitation.jpg": {
    "width": 612,
    "height": 405,
    "webp": [
      {
        "src": "/images/optimized/course-recitation-96.webp",
        "width": 96,
        "bytes": 2154
      },
      {
        "src": "/images/optimized/course-recitation-160.webp",
        "width": 160,
        "bytes": 3800
      },
      {
        "src": "/images/optimized/course-recitation-320.webp",
        "width": 320,
        "bytes": 9248
      },
      {
        "src": "/images/optimized/course-recitation-480.webp",
        "width": 480,
        "bytes": 17088
      },
      {
        "src": "/images/optimized/course-recitation-612.webp",
        "width": 612,
        "bytes": 21626
      }
    ],
    "avif": []
  },
  "/images/course-tajweed.jpg": {
    "width": 612,
    "height": 405,
    "webp": [
      {
        "src": "/images/optimized/course-tajweed-96.webp",
        "width": 96,
        "bytes": 2154
      },
      {
        "src": "/images/optimized/course-tajweed-160.webp",
        "width": 160,
        "bytes": 3800
      },
      {
        "src": "/images/optimized/course-tajweed-320.webp",
        "width": 320,
        "bytes": 9248
      },
      {
        "src": "/images/optimized/course-tajweed-480.webp",
        "width": 480,
        "bytes": 17088
      },
      {
        "src": "/images/optimized/course-tajweed-612.webp",
        "width": 612,
        "bytes": 21626
      }
    ],
    "avif": []
  },
  "/images/hero-quran.png": {
    "width": 479,
    "height": 320,
    "webp": [
      {
        "src": "/images/optimized/hero-quran-96.webp",
        "width": 96,
        "bytes": 2212
      },
      {
        "src": "/images/optimized/hero-quran-160.webp",
        "width": 160,
        "bytes": 3958
      },
      {
        "src": "/images/optimized/hero-quran-320.webp",
        "width": 320,
        "bytes": 10062
      },
      {
        "src": "/images/optimized/hero-quran-479.webp",
        "width": 479,
        "bytes": 17702
      }
    ],
    "avif": [
      {
        "src": "/images/optimized/hero-quran-479.avif",
        "width": 479,
        "bytes": 17494
      }
    ]
  },
  "/images/kanwal-logo-on-dark.png": {
    "width": 1668,
    "height": 712,
    "webp": [
      {
        "src": "/images/optimized/kanwal-logo-on-dark-96.webp",
        "width": 96,
        "bytes": 2748
      },
      {
        "src": "/images/optimized/kanwal-logo-on-dark-160.webp",
        "width": 160,
        "bytes": 5562
      },
      {
        "src": "/images/optimized/kanwal-logo-on-dark-320.webp",
        "width": 320,
        "bytes": 14476
      },
      {
        "src": "/images/optimized/kanwal-logo-on-dark-480.webp",
        "width": 480,
        "bytes": 27294
      }
    ],
    "avif": [
      {
        "src": "/images/optimized/kanwal-logo-on-dark-160.avif",
        "width": 160,
        "bytes": 5427
      }
    ]
  },
  "/images/kanwal-logo-on-light.png": {
    "width": 1668,
    "height": 712,
    "webp": [
      {
        "src": "/images/optimized/kanwal-logo-on-light-96.webp",
        "width": 96,
        "bytes": 2764
      },
      {
        "src": "/images/optimized/kanwal-logo-on-light-160.webp",
        "width": 160,
        "bytes": 5492
      },
      {
        "src": "/images/optimized/kanwal-logo-on-light-320.webp",
        "width": 320,
        "bytes": 14052
      },
      {
        "src": "/images/optimized/kanwal-logo-on-light-480.webp",
        "width": 480,
        "bytes": 25892
      }
    ],
    "avif": [
      {
        "src": "/images/optimized/kanwal-logo-on-light-160.avif",
        "width": 160,
        "bytes": 5179
      },
      {
        "src": "/images/optimized/kanwal-logo-on-light-480.avif",
        "width": 480,
        "bytes": 21586
      }
    ]
  },
  "/images/kanwal-mark-on-dark.png": {
    "width": 592,
    "height": 688,
    "webp": [
      {
        "src": "/images/optimized/kanwal-mark-on-dark-96.webp",
        "width": 96,
        "bytes": 4802
      }
    ],
    "avif": [
      {
        "src": "/images/optimized/kanwal-mark-on-dark-96.avif",
        "width": 96,
        "bytes": 4199
      }
    ]
  },
  "/images/kanwal-mark-on-light.png": {
    "width": 592,
    "height": 688,
    "webp": [
      {
        "src": "/images/optimized/kanwal-mark-on-light-96.webp",
        "width": 96,
        "bytes": 4694
      }
    ],
    "avif": [
      {
        "src": "/images/optimized/kanwal-mark-on-light-96.avif",
        "width": 96,
        "bytes": 4018
      }
    ]
  },
  "/images/section-memorize.jpg": {
    "width": 1080,
    "height": 675,
    "webp": [
      {
        "src": "/images/optimized/section-memorize-96.webp",
        "width": 96,
        "bytes": 1762
      },
      {
        "src": "/images/optimized/section-memorize-160.webp",
        "width": 160,
        "bytes": 4080
      },
      {
        "src": "/images/optimized/section-memorize-320.webp",
        "width": 320,
        "bytes": 11920
      },
      {
        "src": "/images/optimized/section-memorize-480.webp",
        "width": 480,
        "bytes": 21806
      },
      {
        "src": "/images/optimized/section-memorize-800.webp",
        "width": 800,
        "bytes": 44358
      },
      {
        "src": "/images/optimized/section-memorize-1080.webp",
        "width": 1080,
        "bytes": 70644
      }
    ],
    "avif": []
  },
  "/images/section-phone.png": {
    "width": 678,
    "height": 452,
    "webp": [
      {
        "src": "/images/optimized/section-phone-96.webp",
        "width": 96,
        "bytes": 1054
      },
      {
        "src": "/images/optimized/section-phone-160.webp",
        "width": 160,
        "bytes": 1930
      },
      {
        "src": "/images/optimized/section-phone-320.webp",
        "width": 320,
        "bytes": 4676
      },
      {
        "src": "/images/optimized/section-phone-480.webp",
        "width": 480,
        "bytes": 8328
      },
      {
        "src": "/images/optimized/section-phone-678.webp",
        "width": 678,
        "bytes": 14746
      }
    ],
    "avif": []
  },
  "/images/wisdom.jpg": {
    "width": 1024,
    "height": 585,
    "webp": [
      {
        "src": "/images/optimized/wisdom-96.webp",
        "width": 96,
        "bytes": 1830
      },
      {
        "src": "/images/optimized/wisdom-160.webp",
        "width": 160,
        "bytes": 3982
      },
      {
        "src": "/images/optimized/wisdom-320.webp",
        "width": 320,
        "bytes": 11130
      },
      {
        "src": "/images/optimized/wisdom-480.webp",
        "width": 480,
        "bytes": 18598
      },
      {
        "src": "/images/optimized/wisdom-800.webp",
        "width": 800,
        "bytes": 35192
      },
      {
        "src": "/images/optimized/wisdom-1024.webp",
        "width": 1024,
        "bytes": 48972
      }
    ],
    "avif": []
  },
  "/mocks/heroMock_desktop.png": {
    "width": 1456,
    "height": 819,
    "webp": [
      {
        "src": "/images/optimized/heroMock_desktop-96.webp",
        "width": 96,
        "bytes": 1070
      },
      {
        "src": "/images/optimized/heroMock_desktop-160.webp",
        "width": 160,
        "bytes": 2078
      },
      {
        "src": "/images/optimized/heroMock_desktop-320.webp",
        "width": 320,
        "bytes": 6172
      },
      {
        "src": "/images/optimized/heroMock_desktop-480.webp",
        "width": 480,
        "bytes": 11588
      },
      {
        "src": "/images/optimized/heroMock_desktop-800.webp",
        "width": 800,
        "bytes": 25326
      },
      {
        "src": "/images/optimized/heroMock_desktop-1200.webp",
        "width": 1200,
        "bytes": 43272
      },
      {
        "src": "/images/optimized/heroMock_desktop-1456.webp",
        "width": 1456,
        "bytes": 57208
      }
    ],
    "avif": []
  },
  "/mocks/heroMock_mobile.png": {
    "width": 896,
    "height": 1344,
    "webp": [
      {
        "src": "/images/optimized/heroMock_mobile-96.webp",
        "width": 96,
        "bytes": 2240
      },
      {
        "src": "/images/optimized/heroMock_mobile-160.webp",
        "width": 160,
        "bytes": 4932
      },
      {
        "src": "/images/optimized/heroMock_mobile-320.webp",
        "width": 320,
        "bytes": 14918
      },
      {
        "src": "/images/optimized/heroMock_mobile-480.webp",
        "width": 480,
        "bytes": 26478
      },
      {
        "src": "/images/optimized/heroMock_mobile-800.webp",
        "width": 800,
        "bytes": 51288
      },
      {
        "src": "/images/optimized/heroMock_mobile-896.webp",
        "width": 896,
        "bytes": 61776
      }
    ],
    "avif": []
  }
};
