"use strict";

// apps/frontend/next.config.js
module.exports = {
  // убираем output: 'export' и distDir
  images: {
    domains: ["localhost", "images.unsplash.com"]
  }
};
