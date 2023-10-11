#!/bin/bash

cd $(pwd)

shopt -s nullglob nocaseglob extglob

# Specify the directory containing the files

# Convert .mov to .mp4
for FILE in *.mov; do    
    # Convert .mov to .mp4 using ffmpeg
    ffmpeg -i "$FILE" "${FILE%.*}".mp4
    
    # Delete the original .mov file
    rm "$FILE"
done

# Convert .mp4 to .webm
for FILE in *.mp4; do
    # Check if the corresponding .webm file already exists
    if [ -f "${FILE%.*}.webm" ]; then
        echo "Skipping conversion of $FILE to .webm as the file already exists."
    else
        # Convert .mp4 to .webm using ffmpeg
        ffmpeg -i "$FILE" "${FILE%.*}".webm
    fi
done

# Convert images to .webp

# PARAMS=('-m 6 -q 50 -mt -af -progress')

for FILE in *.@(jpg|jpeg|tif|tiff|png); do 
    cwebp $PARAMS "$FILE" -o "${FILE%.*}".webp;
done