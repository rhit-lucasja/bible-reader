#!/bin/bash
set -e

# This script uses the USCCB website to gather text for NABRE into a JSON for use
# elsewhere in this project. The script is a loose modification of one available at
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

chapters_file="./book-chapters.json"
output_file="./nabre.json"
echo '[' > "$output_file"
# USCCB is official site for NABRE
base_url="https://www.biblegateway.com/passage"
# get a book and chapters with /?search=$name%20$chapter&version=NABRE
# list of all books available at base URL
# intro to book (including longer title) at /${name.lower()}/0
# to access a chapter at a time, use route /${name.lower()}/${chapterNum}

# create temp HTML file to save to and ensure it deletes even after error
temp_html=$(mktemp /tmp/chapter_XXXXXX.html)
trap 'rm -f "$temp_html"' EXIT
# temp JSON file that TypeScript saves to after verse parsing
temp_ch=$(mktemp /tmp/chapter_XXXXXX.json)
trap 'rm -f "$temp_ch"' EXIT

# Loop over books using the data JSON file
jq -c '.[]' "$chapters_file" | while read -r entry; do
  id=$(echo "$entry" | jq -r '.id') # 3-letter ID
  name=$(echo "$entry" | jq -r '.name') # common name (serves also as route on USCCB site)
  title=$(echo "$entry" | jq -r '.title') # longer title
  numChapters=$(echo "$entry" | jq -r '.numChapters') # number of chapters in the book
  echo "Processing $id"

  # Start an empty array for chapters of the current book
  book_json=$(jq -n --arg id "$id" --arg name "$name" --arg title "$title" '{"id": $id, "name": $name, "title": $title, "chapters": []}')

  # Loop through each chapter
  for chapter in $(seq 1 "$numChapters"); do
    
    # Temporary json to store verses for the current chapter
    chapter_json=$(jq -n --arg number "$chapter" '{"number": $number, "content": []}')
    
    # Credits to https://github.com/RaynardGerraldo/bible_verse-cli
    ### DEBUG: Uncomment the following lines to test a specific book/chapter only
    # name="Psalms"
    # chapter=23
    target_url="$base_url/?search=$name%20$chapter&version=NABRE"
    echo "=> Chapter $chapter at $target_url"
    curl -s \
      -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
      -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
      -H "Accept-Language: en-US,en;q=0.9" \
      -H "Accept-Encoding: gzip, deflate, br" \
      --compressed \
      "$target_url" \
      -o "$temp_html"

    # check if content received properly
    if ! grep -q 'passage-content' "$temp_html"; then
      echo "=> ERROR: Failed to receive passage contents"
      cat "$temp_html" > "./err.html"
      exit 1
    fi

    # run TypeScript to parse verse contents
    npx tsx src/seed/sources/nabre-scraper/parse-chapter.ts "$temp_ch" "$temp_html" "$chapter"

    # gather the resulting chapter JSON and add to current book
    chapter_json=$(jq '.' "$temp_ch")
    book_json=$(echo "$book_json" | jq --argjson chapter "$chapter_json" '.chapters += [$chapter]')
    ### DEBUG: UNCOMMENT TO STOP LOOP AFTER CHAPTER 1
    # break

    # sleep a bit so as not to explode web servers
    sleep 1

  done
  
  # append the book to output file
  echo -n "$book_json" >> "$output_file"
  echo ',' >> "$output_file"

  ### DEBUG: UNCOMMENT TO STOP LOOP AFTER FIRST BOOK ###
  # break

done

# Close the array of books
sed -i '$ s/.$//' "$output_file"
echo ']' >> "$output_file"