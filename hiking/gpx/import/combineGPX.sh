#!/bin/bash
# Script to combine multiple GPX files into a single file

output_file="combined.gpx"

# Create the header for the combined GPX file
echo '<?xml version="1.0" encoding="UTF-8"?>' > "$output_file"
echo '<gpx version="1.1" creator="Combined GPX" xmlns="http://www.topografix.com/GPX/1/1">' >> "$output_file"
echo '<metadata>' >> "$output_file"
echo '  <name>Combined GPX File</name>' >> "$output_file"
echo '  <time>'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'</time>' >> "$output_file"
echo '</metadata>' >> "$output_file"
echo '<trk>' >> "$output_file"
echo '  <name>Combined Track</name>' >> "$output_file"
echo '  <trkseg>' >> "$output_file"

# Loop through all GPX files in the directory
for input_file in ./*.gpx;
do
  # Extract the track points from each GPX file and append to the output file
  sed -n '/<trkpt /,/<\/trkpt>/p' "$input_file" >> "$output_file"
done

# Close the combined GPX file
echo '  </trkseg>' >> "$output_file"
echo '</trk>' >> "$output_file"
echo '</gpx>' >> "$output_file"

echo "Combined GPX file saved as $output_file"
