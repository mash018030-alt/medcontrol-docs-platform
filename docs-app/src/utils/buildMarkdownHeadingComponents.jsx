import MarkdownHeading from '../components/MarkdownHeading'
import { markdownHeadingPlainText } from './markdownHeadingPlainText'
import { stableHeadingIdFromNode } from './headingSlug'

/** h1–h6 для ReactMarkdown: стабильные id и якорь «#» (кроме mc_pdf). */
export function buildMarkdownHeadingComponents(isMcPdf) {
  const mk = (level) => (incoming) => {
    const { children, node, id: _ignoreMdId, ...props } = incoming
    const id = stableHeadingIdFromNode(markdownHeadingPlainText(children), node)
    return (
      <MarkdownHeading level={level} id={id} isMcPdf={isMcPdf} {...props}>
        {children}
      </MarkdownHeading>
    )
  }

  return {
    h1: mk(1),
    h2: mk(2),
    h3: mk(3),
    h4: mk(4),
    h5: mk(5),
    h6: mk(6),
  }
}
