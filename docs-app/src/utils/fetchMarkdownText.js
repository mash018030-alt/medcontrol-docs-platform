/** Сообщение по умолчанию, если вместо .md пришла HTML-заглушка (типично Vite dev при 404 в public). */
export const MARKDOWN_FETCH_NOT_FOUND = 'Статья не найдена'

/**
 * Тело ответа с уже проверенным r.ok. Отсекает text/html и разметку документа —
 * иначе ReactMarkdown получает index.html и падает (белый экран).
 * @param {Response} response
 * @param {string} [wrongBodyMessage]
 * @returns {Promise<string>}
 */
export async function readFetchedMarkdownBody(response, wrongBodyMessage = MARKDOWN_FETCH_NOT_FOUND) {
  const ct = (response.headers.get('content-type') || '').toLowerCase()
  if (ct.includes('text/html')) {
    throw new Error(wrongBodyMessage)
  }
  const text = await response.text()
  const t = text.trimStart()
  if (t.startsWith('<!DOCTYPE') || t.startsWith('<!doctype') || t.startsWith('<html')) {
    throw new Error(wrongBodyMessage)
  }
  return text
}

/**
 * fetch + проверка, что это markdown, а не SPA index.html.
 * @param {string} url
 * @param {{ notFoundMessage?: string }} [opts]
 * @returns {Promise<{ text: string, lastModified: string | null }>}
 */
export async function fetchMarkdownText(url, { notFoundMessage = MARKDOWN_FETCH_NOT_FOUND } = {}) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(notFoundMessage)
  const lastModified = r.headers.get('last-modified')
  const text = await readFetchedMarkdownBody(r, notFoundMessage)
  return { text, lastModified }
}
