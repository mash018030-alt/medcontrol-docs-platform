import rehypeRaw from 'rehype-raw'
import { rehypeFootnotesSection } from './rehype-footnotes-section'
import { rehypePublicAssets } from './rehype-public-assets'
import { rehypeInlineTooltip } from './rehype-inline-tooltip'
import { rehypeFootnoteTooltips } from './rehype-footnote-tooltips'
import { rehypeSanitizeChildLists } from './rehype-sanitize-child-lists'

/** Единый набор rehype-плагинов для статей документации и новостей. */
export function docsMarkdownRehypePlugins() {
  return [
    rehypeRaw,
    rehypeFootnotesSection,
    rehypePublicAssets,
    rehypeInlineTooltip,
    rehypeFootnoteTooltips,
    rehypeSanitizeChildLists,
  ]
}
