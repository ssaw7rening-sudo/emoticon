export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
      extend: {
          "colors": {
                  "background": "#FFF9EE",
                  "surface": "#FFFFFF",
                  "surface-container-lowest": "#FFFFFF",
                  "surface-container-low": "#FFF2E5",
                  "surface-container": "#FFECA1",
                  "surface-container-high": "#FFD166",
                  "surface-container-highest": "#CFF3E5",
                  "surface-variant": "#AEE8D5",
                  "primary": "#FFD166",
                  "primary-strong": "#7A4F00",
                  "on-primary": "#333333",
                  "primary-container": "#FFF2D1",
                  "on-primary-container": "#5C4B13",
                  "secondary": "#CFF3E5",
                  "secondary-strong": "#184F43",
                  "on-secondary": "#184F43",
                  "secondary-container": "#DDF7EE",
                  "on-secondary-container": "#184F43",
                  "mint-soft": "#E8F8F2",
                  "mint-hover": "#C5F2E3",
                  "mint": "#A6E3D0",
                  "mint-strong": "#2C6154",
                  "mint-border": "#D0EFE3",
                  "tertiary": "#80D8DA",
                  "on-tertiary": "#FFFFFF",
                  "tertiary-container": "#C1F0F0",
                  "on-tertiary-container": "#0B4D4D",
                  "error": "#C92A4F",
                  "on-error": "#FFFFFF",
                  "error-container": "#FFD6DD",
                  "on-error-container": "#680014",
                  "on-background": "#333333",
                  "on-surface": "#333333",
                  "on-surface-variant": "#666666",
                  "outline": "#FFD166",
                  "outline-variant": "#FFECA1"
          },
          "borderRadius": {
                  "DEFAULT": "1rem",
                  "lg": "1.25rem",
                  "xl": "1.5rem",
                  "2xl": "2rem",
                  "3xl": "2.5rem",
                  "full": "9999px"
          },
          "spacing": {
                  "gutter": "16px",
                  "base": "4px",
                  "sm": "12px",
                  "xl": "48px",
                  "md": "20px",
                  "lg": "32px",
                  "container-margin": "24px",
                  "xs": "8px"
          },
          "fontFamily": {
                  "body-md": ["Paperlogy", "sans-serif"],
                  "display-lg": ["Paperlogy", "sans-serif"],
                  "label-sm": ["Paperlogy", "sans-serif"],
                  "label-md": ["Paperlogy", "sans-serif"],
                  "display-lg-mobile": ["Paperlogy", "sans-serif"],
                  "body-lg": ["Paperlogy", "sans-serif"],
                  "headline-sm": ["Paperlogy", "sans-serif"],
                  "headline-md": ["Paperlogy", "sans-serif"]
          },
          "fontSize": {
                  "body-md": ["15px", {"lineHeight": "22px", "letterSpacing": "0", "fontWeight": "400"}],
                  "display-lg": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                  "label-sm": ["11px", {"lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500"}],
                  "label-md": ["13px", {"lineHeight": "18px", "letterSpacing": "0.01em", "fontWeight": "600"}],
                  "display-lg-mobile": ["32px", {"lineHeight": "38px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                  "body-lg": ["17px", {"lineHeight": "26px", "letterSpacing": "-0.01em", "fontWeight": "500"}],
                  "headline-sm": ["20px", {"lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                  "headline-md": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "700"}]
          }
      }
  },
  plugins: [],
}
