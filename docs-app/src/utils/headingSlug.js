/** Единая генерация стабильных id для заголовков (оглавление, якоря, хеш в URL). */

const CYRILLIC_LATIN = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  і: 'i',
  ї: 'yi',
  є: 'e',
  ґ: 'g',
}

export function transliterateHeadingText(input) {
  let out = ''
  for (const ch of String(input)) {
    const lower = ch.toLowerCase()
    if (CYRILLIC_LATIN[lower] !== undefined) {
      out += CYRILLIC_LATIN[lower]
    } else {
      out += ch
    }
  }
  return out
}

/**
 * Slug из текста заголовка: lowercae, пробелы → «-», латиница/цифры/дефис, без спецсимволов.
 * Кириллица предварительно транслитерируется.
 */
export function slugifyHeadingText(text) {
  const normalized = transliterateHeadingText(String(text).normalize('NFKC').trim())
  const lower = normalized.toLowerCase()
  const dashed = lower.replace(/\s+/g, '-')
  const ascii = dashed.replace(/[^a-z0-9-]/g, '')
  return ascii.replace(/-+/g, '-').replace(/^-|-$/g, '')
}

/** Селектор заголовков статьи с id (scroll-spy, оглавление из DOM). */
export const DOCS_ARTICLE_HEADING_SELECTOR = 'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'

/**
 * Уникальные id при повторных одинаковых заголовках: foo, foo-2, foo-3…
 * @returns {(plainText: string) => string}
 */
export function createHeadingSlugAllocator() {
  const counts = Object.create(null)
  return (plainText) => {
    let base = slugifyHeadingText(plainText)
    if (!base) base = 'section'
    const next = (counts[base] ?? 0) + 1
    counts[base] = next
    if (next === 1) return base
    return `${base}-${next}`
  }
}
