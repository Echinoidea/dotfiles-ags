

#!/bin/bash

# Directory containing images
DIR=$1
SATURATE=$2

# Check if directory is provided and exists
if [[ -z "$DIR" ]]; then
  echo "Usage: $0 <directory-of-images>"
  exit 1
elif [[ ! -d "$DIR" ]]; then
  echo "Directory '$DIR' not found!"
  exit 1
fi

# Get a random image from the directory
RANDOM_IMAGE=$(find "$DIR" -type f \( -iname '*.jpg' -o -iname '*.png' -o -iname '*.jpeg' -o -iname '*.gif' \) | shuf -n 1)

# Check if an image was found
if [[ -z "$RANDOM_IMAGE" ]]; then
  echo "No images found in the directory."
  exit 1
else
  echo "Random image selected: $RANDOM_IMAGE"
  
  # Set wallpaper with swww img
  swww img "$RANDOM_IMAGE" --transition-type left --filter Nearest --transition-fps 30 --transition-step 2 --transition-duration 1 
  
  # sleep 0.5
  # Apply the colorscheme with wal
  wal -i "$RANDOM_IMAGE" --saturate "$SATURATE" 
fi

exit
