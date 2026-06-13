import { readFileSync, appendFileSync, close } from 'node:fs'
import * as cheerio from 'cheerio'
import type { Element } from 'domhandler'

type ContentItem =
    | { type: 'heading'; content: string[] }
    | { type: 'line_break' }
    | { type: 'hebrew_subtitle'; content: unknown[] }
    | { type: 'verse'; number: number; content: unknown[] }

const content: ContentItem[] = []
let currentVerse: { number: number; parts: string[] } | null = null

// helper functions
// removes footnote/cross-ref markers before extracting verse text
function cleanText($el: cheerio.Cheerio<Element>): string {
    const clone = $el.clone()
    clone.find('a.fnref, a.enref, a.fn, a.en').remove()
    return clone.text().replace(/\s+/g, ' ').trim()
}
// save text and details of current verse to content stream
function flushVerse() {
    if (currentVerse) {
        content.push({
            type: 'verse',
            number: currentVerse.number,
            content: [currentVerse.parts.join(' ')]
        })
        currentVerse = null
    }
}

const [, , outputPath, inputPath, numberStr] = process.argv
const number = parseInt(numberStr, 10)

// load HTML structure from generated input file
const inputFile = readFileSync(inputPath, 'utf-8')
const $ = cheerio.load(inputFile)

// iterate through all children elements of content area
$('#scribeI').children().each((_, el) => {
    // get tag type and class (if applicable) from element
    const $el = $(el)
    const tag = el.tagName
    const cls = $el.attr('class') ?? ''
    console.log(`Parsing <${tag}> tag with class '${cls}'`)

    // skip footnotes and cross-references
    if (cls.includes('fn') || cls.includes('en')) return

    // section headings
    if (tag === 'h3' && cls.includes('cs')) {
        // subtitle, like "The Lord, Shepherd and Host" for Psalm 23
        flushVerse()
        content.push({ type: 'heading', content: [cleanText($el)] })
        return
    }
    if (tag === 'h4' && cls.includes('chsect')) {
        // section number, like those that separate Psalms with Roman numerals
        flushVerse()
        content.push({ type: 'heading', content: [cleanText($el)] })
        return
    }
    if (tag === 'h3' && cls.includes('ch')) {
        // skip "CHAPTER #" heading
        return
    }

    // paragraph containing a new verse
    const verseDiv = $el.find('div.verse')
    if (verseDiv.length > 0) {
        flushVerse()

        // inline heading before the verse
        const strongHeading = $el.find('> strong').first()
        if (strongHeading.length > 0) {
            content.push({ type: 'heading', content: [cleanText(strongHeading)] })
        }

        const number = parseInt(verseDiv.find('span.bcv').text(), 10)
        const text = cleanText(verseDiv.find('span.txt'))

        currentVerse = { number, parts: [text] }
        return
    }

    // "wv" continuation of a current verse with a line break
    if (cls.includes('wv') && currentVerse) {
        currentVerse.parts.push('\n' + cleanText($el))
        return
    }

})

// save any remaining verse contents
flushVerse()

const result = { number, content }
appendFileSync(outputPath, JSON.stringify(result))