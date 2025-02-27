#!/bin/bash

#removes Heart Rate data from GPX files

# Loop through all GPX files in the directory
for input_file in ./*.gpx;
do
  # Skip files that already have _processed.gpx in their name
  if [[ "$input_file" == *_processed.gpx ]]; then
    continue
  fi

  output_file="${input_file%.gpx}_processed.gpx"

  # Use sed to remove all <extensions> blocks
  sed '/<extensions>/,/<\/extensions>/d' "$input_file" > "$output_file"

  echo "Processed file saved as $output_file"
done
