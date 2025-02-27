#!/bin/bash
#Compresses an GPX file by removing two points after each point

if [ -z "$1" ]; then
  echo "Usage: $0 <input>"
  exit 1
fi
input_file=$1

awk '
  BEGIN { RS = "<trkpt"; ORS = "<trkpt" }
  NR % 3 == 1 { print $0 }
' "$input_file" > "$input_file.compressed.gpx"

echo "Compression complete. Output saved to $input_file.compressed.gpx"



# add
      #</trkseg>
      #</trk>
      #</gpx>
