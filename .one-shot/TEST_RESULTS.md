# Test Results — career-narrative
Date: Wed Apr 29 02:02:11 PM EDT 2026

## npm run build

> one-shot-template@0.1.0 build
> vite build

vite v6.4.1 building for production...
transforming...
✓ 2055 modules transformed.
Generated an empty chunk: "vendor".
rendering chunks...
computing gzip size...
dist/index.html                              2.02 kB │ gzip:   0.66 kB
dist/assets/pdf.worker.min-iDqQPrd3.mjs  1,232.30 kB
dist/assets/index-BCGvw_QE.css              74.38 kB │ gzip:  12.49 kB
dist/assets/vendor-l0sNRNKZ.js               0.00 kB │ gzip:   0.02 kB
dist/assets/convex-DKCURSs-.js               0.03 kB │ gzip:   0.05 kB
dist/assets/icons-DOmgH3R1.js                6.95 kB │ gzip:   2.75 kB
dist/assets/ui-BCbH82SP.js                  13.83 kB │ gzip:   5.07 kB
dist/assets/router-DSpHEqnt.js             161.12 kB │ gzip:  52.67 kB
dist/assets/index-Cr9kBkrO.js            1,131.97 kB │ gzip: 306.48 kB

(!) Some chunks are larger than 1000 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 17.19s
**PASS**

## npx convex codegen
Running TypeScript typecheck…
**PASS**

## TypeScript check
**PASS**

## Overall: ✅ ALL TESTS PASSED
