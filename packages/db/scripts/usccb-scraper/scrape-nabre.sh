#!/bin/bash

# This script scrapes USCCB's website to gather text for NABRE into a JSON for use
# elsewhere in this project. The script is a modification of one available at
# https://github.com/nirmalben/bible-nabre-json-dataset, and as such credit must
# be awarded to Nirmal Benann for his idea and initial iteration.

# MIT License
#
# Copyright (c) 2024 Nirmal Benann
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

chapters_file="./data/bible-nabre-book-chapters.json"
output_file="./nabre.json"

# Initialize the full Bible JSON file with an empty array
echo '[]' > "$output_file"

# Loop over the JSON containing the book and the number of verses per chapter per book
jq -c '.[]' "$chapters_file" | while read -r entry; do
    book=$(echo "$entry" | jq -r '.Book') # book name
    chapters=$(echo "$entry" | jq -r '.Chapters') # number of chapters in the book

    echo "Processing Book: $book"
    
    # Start an empty array for the chapters of the current book
    book_json=$(jq -n --arg book "$book" '{"book": $book, "chapters": []}')

    # Loop through each chapter
    for chapter in $(seq 1 "$chapters"); do
      echo "  Chapter $chapter"
      
      # Temporary file to store verses for the current chapter
      chapter_file=$(mktemp)
      echo '[]' > "$chapter_file"  # Start with an empty array for verses

      # Fetch and process verses
      verse=1
      while true; do
        # Credits to https://github.com/RaynardGerraldo/bible_verse-cli
        biblegateway_html=$(curl -s "https://www.biblegateway.com/passage/?search=$book+$chapter:$verse&version=NABRE")
        verse_text=$(printf "%s" "$biblegateway_html" | sed -n 's/.*<meta property="og:description" content="\(.*\)".*/\1/p')

        if [ -z "$verse_text" ]; then
          break
        fi

        # Append the verse to the chapter file directly
        jq --argjson verse "$verse" --arg verse_text "$verse_text" '. += [{"verse": ($verse|tonumber), "text": $verse_text}]' "$chapter_file" > "$chapter_file.tmp" && mv "$chapter_file.tmp" "$chapter_file"

        verse=$((verse + 1))
      done

      # Read the verses directly from chapter_file and create a chapter JSON
      verses_json=$(<"$chapter_file")  # Read the verses directly
      chapter_json=$(jq -n --argjson chapter "$chapter" --argjson verses "$verses_json" '{
        "chapter": $chapter,
        "verses": $verses
      }')

      # Append the chapter JSON directly to the book JSON
      book_json=$(echo "$book_json" | jq --argjson chapter_json "$chapter_json" '.chapters += [$chapter_json]')
      
      rm "$chapter_file" # Clean up chapter file
    done

    # Write the book JSON to the output directory (individual book JSON files)
    book_output_file="$output_dir/$book.json"
    echo "$book_json" > "$book_output_file"

    # Write the book JSON directly to the output file
    echo "$book_json" >> "$output_file"  # Append the book JSON to the final output file
done

# The final `bible_json` is saved in `./generated_data/nabre.json`