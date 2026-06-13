import { readFileSync, appendFileSync } from 'node:fs'
import * as cheerio from 'cheerio'

const [, , outputPath, inputPath, number] = process.argv

const inputFile = readFileSync(inputPath, 'utf-8')
const $ = cheerio.load(inputFile)



// const content: ContentItem[] = []
// let currentVerse: { number: number; parts: string[] } | null = null

// function flushVerse() {
//   if (currentVerse) {
//     content.push({
//       type: 'verse',
//       number: currentVerse.number,
//       content: [currentVerse.parts.join(' ')],
//     })
//     currentVerse = null
//   }
// }

// $('#scribeI').children().each((_, el) => {
//   const $el = $(el)
//   const tag = el.tagName
//   const cls = $el.attr('class') ?? ''

//   // Skip footnotes and cross-references entirely
//   if (cls.includes('fn') || cls.includes('en')) return

//   // Section headings
//   if (tag === 'h3' && cls.includes('cs')) {
//     flushVerse()
//     content.push({ type: 'heading', content: [cleanText($el)] })
//     return
//   }
//   if (tag === 'h4' && cls.includes('chsect')) {
//     flushVerse()
//     content.push({ type: 'heading', content: [cleanText($el)] })
//     return
//   }
//   if (tag === 'h3' && cls.includes('ch')) {
//     // chapter number heading — skip, already known
//     return
//   }

//   // Paragraph containing a new verse (div.verse present)
//   const verseDiv = $el.find('div.verse')
//   if (verseDiv.length > 0) {
//     flushVerse()

//     // Inline heading before the verse div (e.g. <strong>...</strong>)
//     const strongHeading = $el.find('> strong').first()
//     if (strongHeading.length > 0) {
//       content.push({ type: 'heading', content: [cleanText(strongHeading)] })
//     }

//     const number = parseInt(verseDiv.find('span.bcv').text(), 10)
//     const text = cleanText(verseDiv.find('span.txt'))

//     currentVerse = { number, parts: [text] }
//     return
//   }

//   // "wv" continuation line — append to current verse, with a line break
//   if (cls.includes('wv') && currentVerse) {
//     currentVerse.parts.push('\n' + cleanText($el))
//     return
//   }
// })

// flushVerse()

//const result = { book, chapter, content }

//appendFileSync('./scraped/usccb-nab.json', JSON.stringify(result) + '\n')