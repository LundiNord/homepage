#!/bin/bash

# Find all .js files in the current directory and subdirectories
find . -type f -name "*.js" ! -name "*.minified.js" ! -path "./libs/*" | while read -r file; do
    # Define the output file name
    minified_file="${file%.js}.minified.js"

    # Minify the file using terser
    terser "$file" -c -m -o "$minified_file"

    # Print the result
    echo "Minified $file to $minified_file"
done
