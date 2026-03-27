import MarkdownHeading from '../components/MarkdownHeading'
import { markdownHeadingPlainText } from './markdownHeadingPlainText'

/** h1–h6 для ReactMarkdown: стабильные id и якорь «#» (кроме mc_pdf). */
export function buildMarkdownHeadingComponents(allocateHeadingId, isMcPdf) {
  const mk = (level) => (incoming) => {
    const { children, node: _ignoreNode, id: _ignoreMdId, ...props } = incoming
    return (
      <MarkdownHeading
        level={level}
        id={allocateHeadingId(markdownHeadingPlainText(children))}
        isMcPdf={isMcPdf}
        {...props}
      >
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
