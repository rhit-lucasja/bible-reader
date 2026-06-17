import { readFileSync, writeFileSync } from 'node:fs'
import * as cheerio from 'cheerio'
import type { Element } from 'domhandler'


// flatten <p> and other content tags into a linear stream of text/verseNum markers
type Token = { type: 'text'; value: string }
    | { type: 'heading'; value: string }
    | { type: 'number'; value : number }
    | { type: 'line-break' }

function flattenParagraph($p: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI): Token[] {
    const tokens: Token[] = []

    function walk(node: any) {
        if (node.type === 'text') {
            tokens.push({ type: 'text', value: node.data })
            return
        }
        if (node.type === 'tag') {
            const $node = $(node)

            // ignore footnotes or cross-reference tags
            if ($node.hasClass('footnote') || $node.hasClass('crossreference')) {
                return
            }

            // line breaks, especially show up in poetry segments
            if (node.tagName === 'br') {
                tokens.push({ type: 'line-break' })
                return
            }

            // inline heading tag, don't recurse into but record token
            if (node.tagName === 'b' && $node.hasClass('inline-h3')) {
                // tokens.push({ type: 'number', value: parseInt($node.text().trim(), 10) })
                tokens.push({ type: 'heading', value: $node.text().trim() })
                return
            }
            
            // verse number tag
            if (node.tagName === 'sup' && $node.hasClass('versenum')) {
                tokens.push({ type: 'number', value: parseInt($node.text().trim(), 10) })
                return
            }

            // recurse into children of anything else
            ;(node.children ?? []).forEach(walk)
        }
    }

    $p.contents().each((_, node) => walk(node))
    return tokens
}

type ContentItem = { type: 'heading'; content: string[] }
    | { type: 'inline-heading'; content: string[] }
    | { type: 'verse'; number: number; content: string[] }
    | { type: 'line-break' }

const content: ContentItem[] = []
let currentNum: number | null = null
let currentParts: string[] = []

// helper function to save text of current stream to content
function flush() {
    if (currentNum !== null) {
        const verseContents: string[] = []
        let text = ''
        for (const i in currentParts) {
            const part = currentParts[i]
            if (part === '\n') {
                // reflect line break by separating text in Verse object
                if (text.length > 0) {
                    verseContents.push(text)
                    text = ''
                }
            } else {
                // combine parts of the same line in the verse
                text = [text, part].join(' ').replace(/[^\S\n]+/g, ' ').trim()
            }
        }
        if (text.length > 0) {
            verseContents.push(text)
        }
        
        // push parsed verse
        if (verseContents.length > 0) {
            content.push({
                type: 'verse',
                number: currentNum,
                content: verseContents
            })
        }
        if (currentParts[currentParts.length - 1] === '\n') {
            // if stream ended with new line, represent with break
            content.push({ type: 'line-break' })
        }
        currentParts = []
    }
}

const [, , outputPath, inputPath, numberStr] = process.argv
const number = parseInt(numberStr, 10)

// load HTML structure from generated input file
const inputFile = readFileSync(inputPath, 'utf-8')
const $ = cheerio.load(inputFile)

// iterate through all children elements of content area
$('.text-html').first().children().each((_, el) => {
    // get tag type and class (if applicable) from element
    const $el = $(el)
    const tag = el.tagName

    // skip footnotes and cross-references
    if ($el.hasClass('footnotes') || $el.hasClass('crossrefs')) return
    // skip "CHAPTER #" or similar subheadings
    if ((tag === 'h3' && $el.hasClass('chapter')) || (tag === 'h2' && $el.hasClass('outline'))) {
        return
    }

    // other headings are like Psalm titles or I/II separators
    if (tag === 'h3') {
        // flush()
        content.push({ type: 'heading', content: [$el.text().trim()] })
        return
    }

    // new <p> or <div> tag means line break in chapter display
    if (currentNum !== null) {
        flush()
        if (content[content.length - 1].type != 'line-break') {
            // prevents duplicate line breaks between paragraphs
            content.push({ type: 'line-break' })
        }
    }

    // else flatten paragraph that may contain multiple verses
    // div poetry elements wrap around paragraph elements
    let tokens: Token[] = []
    if (tag == 'div' && $el.hasClass('poetry')) {
        // <div.poetry> tags wrap around <p>
        tokens = flattenParagraph($el.children('p').first(), $)
    } else {
        // direct <p> tag
        tokens = flattenParagraph($el, $)
    }
    for (const token of tokens) {
        if (token.type === 'number') {
            flush() // flush previous verse contents
            currentNum = token.value
        } else if (token.type === 'heading') {
            flush() // flush verse contents
            content.push({ type: 'inline-heading', content: [token.value] })
        } else if (token.type === 'line-break') {
            // push line break into working verse stream
            currentParts.push('\n')
        } else if (currentNum !== null) {
            // else push token contents to working stream in verse
            currentParts.push(token.value)
        }
    }
})

// save any text remaining in stream
flush()

const result = { number, content }
writeFileSync(outputPath, JSON.stringify(result))