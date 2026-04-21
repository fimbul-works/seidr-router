#!/bin/bash

set -e

# Create temporary minified versions using terser
npx terser bundles/seidr-router.js -o bundles/seidr-router.min.js --toplevel -c passes=2 -c ecma=2023 -m --module > /dev/null 2>&1 || true

# Compress the bundles
gzip -f -k bundles/*.min.js
gzip -f -k example/dist/assets/*.js
brotli -f bundles/*.min.js
brotli -f example/dist/assets/*.js

echo ""
echo "=========================================="
echo "Bundle sizes (bytes):"
echo "=========================================="
echo ""
wc -c bundles/*js* example/dist/assets/*.js* | grep -v .cjs | grep -v .map | grep -v total
echo ""
echo "=========================================="
echo ""

# Remove temporary minified and gzipped files
rm -f bundles/*.gz bundles/*.min.js bundles/*.br example/dist/assets/*.gz example/dist/assets/*.br
