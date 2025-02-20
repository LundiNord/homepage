#!/bin/bash

#removes Heart Rate data from GPX files

# Loop through all GPX files in the directory
for input_file in ./*.gpx;
do
  output_file="${input_file%.gpx}_processed.gpx"

  # Use sed to remove all <extensions> blocks
  sed '/<extensions>/,/<\/extensions>/d' "$input_file" > "$output_file"

  echo "Processed file saved as $output_file"
done
