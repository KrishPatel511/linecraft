# Linecraft

A generative art machine. Drag the sliders to shape stacked, wavy lines, pick a
palette, animate it, then download the result as SVG or PNG.

## Run

    npm install
    npm run dev       # development
    npm run build     # production build in dist/

## Structure

- `src/noise.js`   seeded value noise + fractal sum
- `src/art.js`     builds the lines from the slider values
- `src/Artwork.jsx` renders them as SVG
- `src/App.jsx`    controls, palettes, animation, SVG/PNG export

© 2026-present Krish Patel. All Rights Reserved.
