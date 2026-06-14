import { readFileSync, appendFileSync } from 'node:fs'
import * as cheerio from 'cheerio'
import type { Element } from 'domhandler'


// flatten <p> and other content tags into a linear stream of text/verseNum markers
type Token = { type: 'text'; value: string }
    | { type: 'number'; value : number }

function flattenParagraph($p: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI): Token[] {
    const tokens: Token[] = []

    function walk(node: any) {
        if (node.type === 'text') {
            tokens.push({ type: 'text', value: node.data })
            return
        }
        if (node.type === 'tag') {
            const $node = $(node)

            // strip footnote/cross-reference markers and don't recurse
            if (node.tagName === 'a' && ($node.hasClass('fnref') || $node.hasClass('enref'))) {
                return
            }

            // verse number marker, don't recurse into but recognize break
            if (node.tagName === 'span' && $node.hasClass('bcv')) {
                tokens.push({ type: 'number', value: parseInt($node.text().trim(), 10) })
                return
            }

            // recurse into children of everything else
            ;(node.children ?? []).forEach(walk)
        }
    }

    $p.contents().each((_, node) => walk(node))
    return tokens
}

type ContentItem = { type: 'heading'; content: string[] }
    | { type: 'verse'; number: number; content: unknown[] }

const content: ContentItem[] = []
let currentNum: number | null = null
let currentParts: string[] = []
// let currentVerse: { number: number; parts: string[] } | null = null

// helper function to save text of current stream to content
function flush() {
    if (currentNum !== null) {
        content.push({
            type: 'verse',
            number: currentNum,
            content: [currentParts.join('').replace(/[^\S\n]+/g, ' ').trim()]
        })
        currentParts = []
    }
}

const [, , outputPath, inputPath, numberStr] = process.argv
// appendFileSync('src/seed/sources/usccb-scraper/out.html', readFileSync(inputPath, 'utf-8'))
const number = parseInt(numberStr, 10)

// load HTML structure from generated input file
const inputFile = readFileSync(inputPath, 'utf-8')
const $ = cheerio.load(inputFile)
// console.log($('#scribeI').html()?.slice(0, 2000))

// iterate through all children elements of content area
$('#scribeI').children().each((_, el) => {
    // get tag type and class (if applicable) from element
    const $el = $(el)
    const tag = el.tagName

    // skip footnotes and cross-references
    if ($el.hasClass('fn') || $el.hasClass('en')) return

    // section headings
    if (tag === 'h3' && $el.hasClass('cs')) {
        // subtitle, like "The Lord, Shepherd and Host" for Psalm 23
        flush()
        content.push({ type: 'heading', content: [$el.text().trim()] })
        return
    }
    if (tag === 'h4' && $el.hasClass('chsect')) {
        // section, like I/II in Psalms - skip for now
        return
    }
    if (tag === 'h3' && $el.hasClass('ch')) {
        // skip "CHAPTER #" heading
        return
    }

    if (tag !== 'p') return // don't bother with non-<p> tags

    // record inline section header (flushing previous verse) if it exists
    const strong = $el.children('strong').first()
    if (strong.length > 0) {
        flush()
        content.push({ type: 'heading', content: [strong.text().trim()] })
    }

    // if within a verse and have parts to flush, then do it with a new line
    // handles verses that span multiple paragraphs (e.g. poetry)
    if (currentNum !== null && currentParts.length > 0) {
        currentParts.push('\n')
    }

    // else flatten paragraph that may contain multiple verses
    const tokens = flattenParagraph($el, $)
    for (const token of tokens) {
        if (token.type === 'number') {
            flush() // flush previous verse contents
            currentNum = token.value
        } else if (currentNum !== null) {
            // else push token contents to working stream in verse
            currentParts.push(token.value)
        }
    }
})

// save any text remaining in stream
flush()

const result = { number, content }
appendFileSync(outputPath, JSON.stringify(result))