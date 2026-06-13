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
# USCCB is official site for NABRE
base_url="https://bible.usccb.org/bible"
# list of all books available at base URL
# intro to book (including longer title) at /${name.lower()}/0
# to access a chapter at a time, use route /${name.lower()}/${chapterNum}

# create temp HTML file to save to and ensure it deletes even after error
temp_html=$(mktemp /tmp/chapter.html)
trap 'rm -f "$temp_html"' EXIT
# temp JSON file that TypeScript saves to after verse parsing
temp_ch=$(mktemp /tmp/chapter.json)
trap 'rm -f "$temp_ch"' EXIT

# Loop over books using the data JSON file
#jq -c '.[]' "$chapters_file" | while read -r entry; do
#  id=$(echo "$entry" | jq -r '.id') # 3-letter ID
#  name=$(echo "$entry" | jq -r '.name') # common name (serves also as route on USCCB site)
#  title=$(echo "$entry" | jq -r '.title') # longer title
#  numChapters=$(echo "$entry" | jq -r '.numChapters') # number of chapters in the book
### FOR DEBUGGING PURPOSES, ONLY TESTING GENESIS AND PSALMS ###
ids=('GEN' 'PSA')
names=('Genesis' 'Psalms')
titles=('The Book of Genesis' 'The Book of Psalms')
chs=(50 150)
for ((i = 0 ; i < 2 ; i++)); do
  id="${ids[$i]}"
  name="${names[$i]}"
  title="${titles[$i]}"
  numChapters="${chs[$i]}"
### REMOVE THESE LINES AND UNCOMMENT ABOVE ONCE CHAPTER PARSING WORKS
  echo "Processing $id"

  # Start an empty array for chapters of the current book
  book_json=$(jq -n --arg id "$id" --arg name "$name" --arg title "$title" '{"id": $id, "name": $name, "title": $title, "chapters": []}')

  # Loop through each chapter
  for chapter in $(seq 1 "$numChapters"); do

    # save the page with entire chapter contents
    nameStripped="${name// /}"
    echo "  => $base_url/${nameStripped,,}/$chapter"
    curl -s "$base_url/${nameStripped,,}/$chapter" -o "$temp_html"
    
    # run TypeScript to parse verses out of HTML
    npx tsx parse-chapter.ts "$temp_ch" "$temp_html" "$chapter"

    # gather the resulting chapter JSON and add to current book
    chapter_json=$(jq -c '.' "$temp_ch")
    book_json=$(echo "$book_json" | jq --argjson chapter "$chapter_json" '.chapters += [$chapter]')

    # sleep a bit so as not to explode USCCB servers
    sleep 1

  done
  
  # append the book to output file
  echo -n "$book_json" >> "$output_file"
  echo "," >> "$output_file"

  ### DEBUG LINE: UNCOMMENT TO STOP LOOP AFTER GENESIS ###
  break

done

# Close the array of books
sed -i '$ s/.$//' "$output_file"
echo ']' >> "$output_file"