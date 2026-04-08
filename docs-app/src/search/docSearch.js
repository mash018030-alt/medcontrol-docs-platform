import { articleUnderSectionRoot, flatArticles, navTree, navSubtreeContains } from '../data/nav'
import { searchMetadataByPath } from '../data/searchMetadata'

/** @param {string} w */
export function normalizeToken(w) {
  return (w || '').toLowerCase().replace(/ё/g, 'е')
}

/** @param {string} text */
export function normalizeText(text) {
  return (text || '').toLowerCase().replace(/ё/g, 'е')
}

/** Простейшая нормализация русских словоформ к основе (без тяжелой NLP-зависимости). */
export function normalizeRussianStem(token) {
  const t = normalizeToken(token)
  if (!t) return ''
  if (t.length <= 3) return t
  const endings = [
    'иями',
    'ями',
    'ами',
    'иями',
    'иями',
    'ого',
    'ему',
    'ому',
    'ыми',
    'ими',
    'иях',
    'ах',
    'ях',
    'ов',
    'ев',
    'ия',
    'ья',
    'иям',
    'ием',
    'ью',
    'ой',
    'ей',
    'ий',
    'ый',
    'ое',
    'ее',
    'ая',
    'яя',
    'ам',
    'ям',
    'ом',
    'ем',
    'ам',
    'ям',
    'у',
    'ю',
    'а',
    'я',
    'ы',
    'и',
    'е',
    'о',
  ]
  for (const e of endings) {
    if (t.length - e.length >= 3 && t.endsWith(e)) return t.slice(0, -e.length)
  }
  return t
}

/** @param {string} text */
export function tokenize(text) {
  const t = normalizeText(text)
  const m = t.match(/[\p{L}\p{N}]+/gu)
  return m ? m.map(normalizeToken) : []
}

/** Токены текста, нормализованные до основы слова для поиска. */
export function tokenizeForSearch(text) {
  return tokenize(text).map((t) => normalizeRussianStem(t))
}

/** Служебные слова: не участвуют в условии «все слова запроса». */
const QUERY_STOPWORDS = new Set([
  'и',
  'в',
  'на',
  'с',
  'к',
  'ко',
  'по',
  'о',
  'об',
  'для',
  'из',
  'как',
  'или',
  'а',
  'но',
  'да',
  'нет',
  'то',
  'не',
  'от',
  'за',
  'у',
  'же',
  'ли',
  'бы',
  'это',
])

/**
 * Токены для поиска (без очень коротких и без стоп-слов).
 * @param {string} query
 */
export function searchTokensFromQuery(query) {
  const raw = tokenize(query)
  const normalized = raw.map((t) => normalizeRussianStem(t))
  const filtered = normalized.filter((t) => t.length >= 2 && !QUERY_STOPWORDS.has(t))
  return filtered.length > 0 ? filtered : normalized.filter((t) => t.length >= 1)
}

/** @param {string} a @param {string} b */
export function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  /** Одна строка DP: корректно обновляем «столбец» удалений (row[0] = i). */
  const row = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) row[j] = j
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, row[j], row[j - 1])
      prev = tmp
    }
  }
  return row[b.length]
}

/**
 * Нечёткое сравнение токенов (склонения, опечатки, частичное вхождение).
 * @param {string} qt нормализованный токен запроса
 * @param {string} wt нормализованный токен текста
 */
export function fuzzyTokenMatch(qt, wt) {
  if (!qt || !wt) return false
  if (qt === wt) return true
  if (qt.length >= 3 && wt.startsWith(qt)) return true
  if (wt.length >= 3 && qt.startsWith(wt)) return true
  if (qt.length >= 4 && wt.length >= 4 && qt.slice(0, 4) === wt.slice(0, 4)) return true
  const dist = levenshtein(qt, wt)
  const maxL = Math.max(qt.length, wt.length)
  if (maxL <= 6 && dist <= 1) return true
  /* склонения (роль/роли/ролей): dist≤2 только при той же первой букве — иначе ложные пары вроде «роли»/«были» */
  if (maxL >= 4 && maxL <= 12 && dist <= 2 && qt[0] === wt[0]) return true
  if (qt.length >= 4 && wt.includes(qt)) return true
  if (wt.length >= 4 && qt.includes(wt)) return true
  const k = Math.min(4, qt.length, wt.length)
  if (k >= 3 && qt.slice(0, k) === wt.slice(0, k) && Math.abs(qt.length - wt.length) <= 3) {
    return dist <= 2
  }
  return false
}

/**
 * Совпадение для релевантности и подсветки: те же формы слова (роль/роли/ролей),
 * без далёких пар вроде «роли»/«были», которые допускал старый fuzzy.
 * @param {string} qt нормализованный токен запроса
 * @param {string} wt нормализованный токен текста
 */
export function strongTokenMatch(qt, wt) {
  if (!qt || !wt) return false
  if (qt === wt) return true
  if (qt.length >= 3 && wt.startsWith(qt)) return true
  if (wt.length >= 3 && qt.startsWith(wt)) return true
  const c3 = Math.min(3, qt.length, wt.length)
  if (c3 >= 3 && qt.slice(0, c3) === wt.slice(0, c3)) {
    const dist = levenshtein(qt, wt)
    const maxL = Math.max(qt.length, wt.length)
    if (maxL <= 6 && dist <= 1) return true
    if (maxL >= 4 && maxL <= 12 && dist <= 2 && qt[0] === wt[0]) return true
  }
  if (qt.length >= 4 && wt.includes(qt)) return true
  if (wt.length >= 4 && qt.length >= 4 && qt.includes(wt)) {
    if (Math.abs(qt.length - wt.length) <= 2) return true
  }
  return false
}

/**
 * Есть ли в наборе слов хотя бы одно нечёткое совпадение с токеном запроса.
 * @param {string} qt
 * @param {string[]} words уже нормализованные токены
 */
export function tokenMatchesSomeWord(qt, words) {
  return words.some((w) => strongTokenMatch(qt, w))
}

/**
 * Подходит ли слово для подсветки по любому токену запроса (чуть мягче fuzzy для UI).
 * @param {string} wordNorm
 * @param {string[]} queryTokens
 */
export function shouldHighlightWord(wordNorm, queryTokens) {
  if (!wordNorm || !queryTokens.length) return false
  const wordStem = normalizeRussianStem(wordNorm)
  /* Однобуквенные слова (в, к, о, с…) не подсвечиваем по fuzzy — только точное совпадение с токеном запроса. */
  if (wordStem.length === 1) {
    return queryTokens.some((qt) => qt === wordStem)
  }
  for (const qt of queryTokens) {
    if (strongTokenMatch(qt, wordStem)) return true
  }
  return false
}

/**
 * Плоский текст для поиска и сниппетов: без HTML, таблиц, markdown-артефактов.
 * @param {string} md
 */
export function toPlainTextForSearch(md) {
  if (!md) return ''
  let s = md
  s = s.replace(/```[\s\S]*?```/g, '\n')
  s = s.replace(/~~~[\s\S]*?~~~/g, '\n')
  s = s.replace(/<!--[\s\S]*?-->/g, ' ')
  s = s.replace(/`[^`]*`/g, ' ')
  /* Строки таблиц markdown */
  s = s.replace(/^\s*[|][^\n]*$/gm, ' ')
  s = s.replace(/^[\s|:\-–—+]+$/gm, ' ')
  /* Картинки в markdown — не переносим alt (часто это image60.png) в текст для пользователя */
  s = s.replace(/!\[[\s\S]*?\]\([^)]*\)/g, ' ')
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1 ')
  s = s.replace(/^#{1,6}\s+/gm, ' ')
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1')
  s = s.replace(/\*([^*]+)\*/g, '$1')
  s = s.replace(/__([^_]+)__/g, '$1')
  s = s.replace(/_([^_]+)_/g, '$1')
  s = s.replace(/^\s*[-*+]\s+/gm, ' ')
  s = s.replace(/^\s*\d+\.\s+/gm, ' ')
  s = s.replace(/^\s*>\s?/gm, ' ')
  /* HTML-теги (в т.ч. вложенные) — несколько проходов */
  for (let k = 0; k < 6; k++) {
    s = s.replace(/<[^>]+>/g, ' ')
  }
  s = s.replace(/[|>#*_~`]/g, ' ')
  s = s.replace(/&nbsp;/gi, ' ')
  s = s.replace(/&#\d+;/g, ' ')
  s = s.replace(/&[a-z]+;/gi, ' ')
  /* Имена файлов и пути к изображениям, если остались в тексте */
  s = s.replace(/\b[a-zA-Z0-9][\w.-]*\.(?:png|jpe?g|gif|webp|svg)\b/g, ' ')
  s = s.replace(/(?:\/|\b)(?:content\/)?[\w./-]+\.(?:png|jpe?g|gif|webp|svg)\b/g, ' ')
  s = s.replace(/\s+/g, ' ')
  return s.trim()
}

/** @param {string} md */
export function stripMarkdown(md) {
  return toPlainTextForSearch(md)
}

/** @param {string} md */
export function extractLeadingHeading(md) {
  const line = (md || '').trim().split('\n')[0] || ''
  const m = line.match(/^#\s+(.+)$/)
  return m ? m[1].trim() : ''
}

/**
 * Простой YAML-frontmatter для полей поиска.
 * Поддерживает:
 * aliases: [a, b]
 * aliases:
 *   - a
 *   - b
 */
export function parseSearchFrontmatter(md) {
  const source = md || ''
  const fm = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/)
  if (!fm) return { body: source, meta: {} }
  const raw = fm[1]
  const body = source.slice(fm[0].length)
  /** @type {{ aliases?: string[], keywords?: string[], searchTerms?: string[] }} */
  const meta = {}
  const lines = raw.split('\n')
  let currentKey = null
  for (const line of lines) {
    const kv = line.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)\s*$/)
    if (kv) {
      currentKey = kv[1]
      const val = kv[2].trim()
      if (!['aliases', 'keywords', 'searchTerms'].includes(currentKey)) continue
      if (val.startsWith('[') && val.endsWith(']')) {
        const arr = val
          .slice(1, -1)
          .split(',')
          .map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean)
        if (arr.length) meta[currentKey] = arr
      } else if (val) {
        meta[currentKey] = [val.replace(/^['"]|['"]$/g, '')]
      } else if (!meta[currentKey]) {
        meta[currentKey] = []
      }
      continue
    }
    const item = line.match(/^\s*-\s+(.+)\s*$/)
    if (item && currentKey && ['aliases', 'keywords', 'searchTerms'].includes(currentKey)) {
      meta[currentKey] ||= []
      meta[currentKey].push(item[1].trim().replace(/^['"]|['"]$/g, ''))
    }
  }
  return { body, meta }
}

/** @param {string} md */
export function extractHeadings(md) {
  const lines = (md || '').split('\n')
  const headings = []
  for (const line of lines) {
    const m = line.match(/^\s*#{2,6}\s+(.+?)\s*$/)
    if (m) headings.push(m[1].trim())
  }
  return headings
}

/** Заголовок для скоринга: пункт меню + H1 из md без повтора, если текст совпадает. */
function dedupeTitleBlob(navPlain, mdPlain) {
  const nav = (navPlain || '').trim()
  const md = (mdPlain || '').trim()
  if (!nav && !md) return ''
  if (!md) return nav
  if (!nav) return md
  if (normalizeText(md) === normalizeText(nav)) return nav
  return `${nav}\n${md}`
}

/**
 * Текст для сниппета и скролла: не склеивать заголовок три раза (нав + H1 + то же в теле после снятия #).
 * Если тело уже начинается с H1, не повторяем его; при отличающемся заголовке в меню добавляем только его.
 */
function buildPlainFullForSnippet(navPlain, mdPlain, plainBody) {
  const body = (plainBody || '').replace(/\s+/g, ' ').trim()
  const nav = (navPlain || '').trim()
  const mdh = (mdPlain || '').trim()
  const headLen = (n) => Math.min(body.length, Math.max(n + 48, 96))
  const bodyStarts = (phrase) =>
    Boolean(phrase) &&
    normalizeText(body.slice(0, headLen(phrase.length))).startsWith(normalizeText(phrase))

  if (mdh && bodyStarts(mdh)) {
    if (!nav || normalizeText(nav) === normalizeText(mdh)) return body
    return `${nav} ${body}`.replace(/\s+/g, ' ').trim()
  }
  if (nav && !mdh && bodyStarts(nav)) return body
  if (nav && mdh && normalizeText(nav) === normalizeText(mdh) && bodyStarts(nav)) return body

  const parts = []
  if (nav) parts.push(nav)
  if (mdh && normalizeText(mdh) !== normalizeText(nav)) parts.push(mdh)
  const titlePrefix = parts.join(' ').trim()
  if (!titlePrefix) return body
  if (bodyStarts(titlePrefix)) return body
  return `${titlePrefix} ${body}`.replace(/\s+/g, ' ').trim()
}

/**
 * Минимальное число слов в теле, внутри которого встречаются все токены запроса (хотя бы по одному fuzzy-hit).
 * @param {string[]} bodyWords токены из tokenize(plain)
 * @param {string[]} queryTokens
 * @returns {null | number} null если в одном окне до 120 слов все токены не собрать
 */
function minWindowAllQueryTokens(bodyWords, queryTokens) {
  if (queryTokens.length <= 1) return 1
  const n = bodyWords.length
  let best = Infinity
  for (let i = 0; i < n; i++) {
    const hit = new Set()
    for (let j = i; j < n && j - i < 120; j++) {
      const w = bodyWords[j]
      for (let ti = 0; ti < queryTokens.length; ti++) {
        if (strongTokenMatch(queryTokens[ti], w)) hit.add(ti)
      }
      if (hit.size === queryTokens.length) {
        best = Math.min(best, j - i + 1)
        break
      }
    }
  }
  return best === Infinity ? null : best
}

/**
 * @param {string[]} bodyWords токены тела (как из tokenize / split)
 * @param {string[]} queryTokens
 */
function proximityBonus(bodyWords, queryTokens) {
  if (queryTokens.length < 2) return 0
  const hitIdx = []
  for (let i = 0; i < bodyWords.length; i++) {
    const w = normalizeToken(bodyWords[i])
    for (const qt of queryTokens) {
      if (strongTokenMatch(qt, w)) {
        hitIdx.push(i)
        break
      }
    }
  }
  let bonus = 0
  for (let a = 0; a < hitIdx.length; a++) {
    for (let b = a + 1; b < hitIdx.length; b++) {
      if (hitIdx[b] - hitIdx[a] <= 14) bonus += 4
    }
  }
  return Math.min(bonus, 18)
}

/**
 * Все слова запроса должны встречаться в заголовке или в тексте (пересечение, не объединение по OR).
 * @param {string} titleText
 * @param {string} bodyText
 * @param {string[]} queryTokens
 */
function scoreDocument(doc, queryTokens) {
  const titleWords = tokenizeForSearch(doc.titleText)
  const aliasWords = tokenizeForSearch(doc.aliasText)
  const headingWords = tokenizeForSearch(doc.headingsText)
  const bodyWords = tokenizeForSearch(doc.bodyText)
  const pathWords = tokenizeForSearch(doc.pathText)

  const titleNorm = normalizeText(doc.titleText).replace(/\s+/g, ' ')
  const aliasNorm = normalizeText(doc.aliasText).replace(/\s+/g, ' ')
  const headingNorm = normalizeText(doc.headingsText).replace(/\s+/g, ' ')
  const bodyNorm = normalizeText(doc.bodyText).replace(/\s+/g, ' ')
  const phrase = normalizeText(queryTokens.join(' ')).replace(/\s+/g, ' ').trim()

  /** @type {Record<string, {title:boolean,alias:boolean,heading:boolean,body:boolean,path:boolean}>} */
  const hitMap = {}
  let covered = 0
  for (const qt of queryTokens) {
    const titleHit = tokenMatchesSomeWord(qt, titleWords)
    const aliasHit = tokenMatchesSomeWord(qt, aliasWords)
    const headingHit = tokenMatchesSomeWord(qt, headingWords)
    const bodyHit = tokenMatchesSomeWord(qt, bodyWords)
    const pathHit = tokenMatchesSomeWord(qt, pathWords)
    hitMap[qt] = { title: titleHit, alias: aliasHit, heading: headingHit, body: bodyHit, path: pathHit }
    if (titleHit || aliasHit || headingHit || bodyHit || pathHit) covered++
  }
  if (covered === 0) return 0

  const coverage = covered / queryTokens.length
  if (queryTokens.length > 1 && coverage < 0.5) return 0

  const exactTitlePhraseHit = phrase.length >= 4 && titleNorm.includes(phrase)
  const nearTitlePhraseHit =
    phrase.length >= 4 &&
    !exactTitlePhraseHit &&
    (headingNorm.includes(phrase) || aliasNorm.includes(phrase) || bodyNorm.includes(phrase))
  const allInTitle = queryTokens.every((qt) => hitMap[qt]?.title)
  const allInAlias = queryTokens.every((qt) => hitMap[qt]?.alias)
  const allInHeading = queryTokens.every((qt) => hitMap[qt]?.heading)
  const win = minWindowAllQueryTokens(bodyWords, queryTokens)

  let score = 8
  if (exactTitlePhraseHit) score += 240
  else if (nearTitlePhraseHit) score += 90

  for (const qt of queryTokens) {
    const hit = hitMap[qt]
    if (hit.title) score += 64
    else if (hit.alias) score += 46
    else if (hit.heading) score += 34
    else if (hit.path) score += 26
    else if (hit.body) score += 18
  }

  if (allInTitle) score += 90
  else if (allInAlias) score += 55
  else if (allInHeading) score += 40

  if (queryTokens.length >= 2 && win !== null) {
    score += Math.max(0, 52 - win)
  }
  score += proximityBonus(bodyWords, queryTokens)
  score += Math.round(coverage * 60)
  return score
}

/**
 * Индекс первого слова в plain, для которого есть strong-совпадение с любым токеном запроса.
 * @param {string} plain
 * @param {string[]} queryTokens
 * @returns {number} -1 если не найдено
 */
export function findFirstStrongMatchWordIndex(plain, queryTokens) {
  const re = /[\p{L}\p{N}]+/gu
  let idx = 0
  let m
  while ((m = re.exec(plain)) !== null) {
    const norm = normalizeToken(m[0])
    for (const qt of queryTokens) {
      if (strongTokenMatch(qt, normalizeRussianStem(norm))) return idx
    }
    idx++
  }
  return -1
}

/**
 * В сниппете есть хотя бы одно слово, которое подсветилось бы так же, как в карточке результата.
 * @param {string} snippet
 * @param {string[]} queryTokens
 */
export function snippetHasHighlightableMatch(snippet, queryTokens) {
  if (!snippet?.trim() || !queryTokens?.length) return false
  const parts = snippet.split(/([\p{L}\p{N}]+)/u)
  for (let i = 1; i < parts.length; i += 2) {
    const w = normalizeToken(parts[i])
    if (w && shouldHighlightWord(w, queryTokens)) return true
  }
  return false
}

/**
 * Фрагмент для сниппета и для Text Fragment / fallback-скролла (тот же участок plain).
 * @param {string} plain
 * @param {string[]} queryTokens
 * @param {number} [radius]
 * @param {number} [forceCenterWordIndex] индекс слова в tokensInText — центрировать окно на первом совпадении
 */
export function buildSnippetResult(plain, queryTokens, radius = 118, forceCenterWordIndex) {
  const empty = {
    snippet: '',
    scrollPhrase: '',
    windowMatchScore: 0,
  }
  if (!plain) return empty

  const tokensInText = []
  const re = /[\p{L}\p{N}]+/gu
  let m
  while ((m = re.exec(plain)) !== null) {
    tokensInText.push({
      raw: m[0],
      start: m.index,
      end: m.index + m[0].length,
      norm: normalizeRussianStem(normalizeToken(m[0])),
    })
  }

  if (tokensInText.length === 0) {
    const t = plain.slice(0, radius * 2)
    return {
      snippet: t + (plain.length > t.length ? '…' : ''),
      scrollPhrase: plain.slice(0, Math.min(80, plain.length)).trim(),
      windowMatchScore: 0,
    }
  }

  let centerTok = 0
  let bestScore = -1

  if (
    typeof forceCenterWordIndex === 'number' &&
    forceCenterWordIndex >= 0 &&
    forceCenterWordIndex < tokensInText.length
  ) {
    centerTok = forceCenterWordIndex
    bestScore = 1
  } else {
    let bestI = 0
    bestScore = -1
    for (let i = 0; i < tokensInText.length; i++) {
      let s = 0
      const windowEnd = Math.min(i + 34, tokensInText.length)
      for (let j = i; j < windowEnd; j++) {
        const tnorm = tokensInText[j].norm
        for (const qt of queryTokens) {
          if (strongTokenMatch(qt, tnorm)) s += 3
        }
      }
      if (s > bestScore) {
        bestScore = s
        bestI = i
      }
    }
    centerTok = bestI
    if (bestScore <= 0) {
      outer: for (const qt of queryTokens) {
        for (let k = 0; k < tokensInText.length; k++) {
          if (strongTokenMatch(qt, tokensInText[k].norm)) {
            centerTok = k
            bestScore = 1
            break outer
          }
        }
      }
    }
  }

  const loTok = Math.max(0, centerTok - 1)
  const hiTok = Math.min(tokensInText.length - 1, centerTok + 5)
  const phraseStart = tokensInText[loTok].start
  const phraseEnd = tokensInText[hiTok].end
  let scrollPhrase = plain.slice(phraseStart, phraseEnd).replace(/\s+/g, ' ').trim()
  if (scrollPhrase.length > 115) {
    scrollPhrase = `${scrollPhrase.slice(0, 112).trim()}…`
  }

  let windowMatchScore = 0
  const densLo = Math.max(0, centerTok - 5)
  const densHi = Math.min(tokensInText.length - 1, centerTok + 7)
  for (let j = densLo; j <= densHi; j++) {
    for (const qt of queryTokens) {
      if (strongTokenMatch(qt, tokensInText[j].norm)) windowMatchScore += 1
    }
  }

  const center = Math.floor(
    (tokensInText[centerTok].start + tokensInText[centerTok].end) / 2,
  )
  const from = Math.max(0, center - radius)
  const to = Math.min(plain.length, center + radius)
  let snippet = plain.slice(from, to).trim()
  if (from > 0) snippet = `… ${snippet}`
  if (to < plain.length) snippet = `${snippet} …`

  return { snippet, scrollPhrase, windowMatchScore }
}

/** @param {string} articlePath */
export function getSectionTitleForPath(articlePath) {
  for (const top of navTree) {
    if (top.path === articlePath) return top.title
    if (top.children?.length && navSubtreeContains(top, articlePath)) {
      return top.title
    }
  }
  return 'Документация'
}

/**
 * @param {Map<string, { md: string, article: { title: string, path: string } }>} docsMap
 * @param {string} query
 * @param {string | null} [sectionRootPath] если задан — только статьи этого раздела (корень user-guide)
 */
export function searchDocuments(docsMap, query, sectionRootPath = null) {
  const queryTokens = searchTokensFromQuery(query)
  if (queryTokens.length === 0) return []

  const results = []

  for (const [, { md, article }] of docsMap) {
    if (sectionRootPath && !articleUnderSectionRoot(article.path, sectionRootPath)) continue
    // Разводящая страница раздела (user-guide) даёт ложные совпадения по ссылкам в списке и дублирует название раздела.
    if (sectionRootPath && article.path === sectionRootPath) continue
    const { body: bodyWithoutFrontmatter, meta } = parseSearchFrontmatter(md)
    const externalMeta = searchMetadataByPath[article.path] || {}
    const mergedMeta = {
      aliases: [...(meta.aliases || []), ...(externalMeta.aliases || [])],
      keywords: [...(meta.keywords || []), ...(externalMeta.keywords || [])],
      searchTerms: [...(meta.searchTerms || []), ...(externalMeta.searchTerms || [])],
    }
    const titleFromMdRaw = extractLeadingHeading(bodyWithoutFrontmatter)
    const titleFromMd = titleFromMdRaw ? toPlainTextForSearch(titleFromMdRaw) : ''
    const titleNavPlain = toPlainTextForSearch(article.title)
    const titleBlob = dedupeTitleBlob(titleNavPlain, titleFromMd)
    const headingsPlain = toPlainTextForSearch(extractHeadings(bodyWithoutFrontmatter).join(' '))
    const aliasesPlain = toPlainTextForSearch(
      [...mergedMeta.aliases, ...mergedMeta.keywords, ...mergedMeta.searchTerms].join(' '),
    )
    const plainBody = toPlainTextForSearch(bodyWithoutFrontmatter)
    const plainFull = buildPlainFullForSnippet(titleNavPlain, titleFromMd, plainBody)
    const pathPlain = toPlainTextForSearch(article.path.replace(/\//g, ' '))
    let score = scoreDocument(
      {
        titleText: titleBlob,
        aliasText: aliasesPlain,
        headingsText: headingsPlain,
        bodyText: plainBody,
        pathText: pathPlain,
      },
      queryTokens,
    )
    if (score <= 0) continue
    let { snippet, scrollPhrase, windowMatchScore } = buildSnippetResult(
      plainFull,
      queryTokens,
    )
    if (!snippetHasHighlightableMatch(snippet, queryTokens)) {
      const fc = findFirstStrongMatchWordIndex(plainFull, queryTokens)
      if (fc >= 0) {
        const retry = buildSnippetResult(plainFull, queryTokens, 118, fc)
        snippet = retry.snippet
        scrollPhrase = retry.scrollPhrase
        windowMatchScore = retry.windowMatchScore
      }
    }
    if (!snippetHasHighlightableMatch(snippet, queryTokens)) continue
    score += Math.min(windowMatchScore, 24) * 1.1
    results.push({
      path: article.path,
      title: article.title,
      sectionTitle: getSectionTitleForPath(article.path),
      score,
      snippet,
      scrollPhrase: scrollPhrase || '',
    })
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.title.localeCompare(b.title, 'ru')
  })
  return results
}

function isNewsPath(path) {
  const top = (path || '').split('/')[0] || ''
  return top.toLowerCase() === 'news' || top === '1_news'
}

function isSectionRootPath(path) {
  if (!path) return false
  if (/\/user_guide$/.test(path)) return true
  if (/\/articles\/00_main$/.test(path)) return true
  return false
}

/**
 * Индекс для поиска: только статьи из nav (flatArticles). Загрузка через fetch с `/content/…`
 * — Vite 7+ не позволяет import.meta.glob по `public/`, иначе модуль не собирается (пустой экран).
 *
 * @returns {Promise<Map<string, { md: string, article: { title: string, path: string } }>>}
 */
export async function loadAllDocs() {
  const articleMap = new Map(flatArticles.map((a) => [a.path, a]))
  const base = (import.meta.env.BASE_URL || '').replace(/\/$/, '')

  const entries = await Promise.all(
    Array.from(articleMap.values())
      .filter((article) => !isNewsPath(article.path))
      .map(async (article) => {
        const path = `${base}/content/${article.path}.md`.replace(/^\/+/, '/')
        const url = new URL(path, window.location.origin).href
        try {
          const r = await fetch(url, { cache: 'no-cache' })
          if (!r.ok) return [article.path, { md: '', article }]
          const md = await r.text()
          return [article.path, { md, article }]
        } catch {
          return [article.path, { md: '', article }]
        }
      }),
  )

  return new Map(entries)
}

/**
 * Быстрые подсказки только по заголовкам: каждое слово запроса должно находиться в заголовке.
 * Возвращает раздел + заголовок, чтобы различать одноимённые статьи.
 * @param {string} query
 * @param {number} limit
 * @param {string | null} [sectionRootPath] только статьи раздела
 * @returns {{ path: string, title: string, sectionTitle: string }[]}
 */
export function suggestArticlesByTitle(query, limit = 6, sectionRootPath = null) {
  const qTokens = searchTokensFromQuery(query)
  if (qTokens.length === 0) return []
  const phrase = normalizeText(qTokens.join(' ')).replace(/\s+/g, ' ').trim()
  /** @type {{ article: { title: string, path: string }, score: number, sectionTitle: string }[]} */
  const scored = []
  for (const article of flatArticles) {
    if (sectionRootPath && !articleUnderSectionRoot(article.path, sectionRootPath)) continue
    if (sectionRootPath && article.path === sectionRootPath) continue
    const titleNorm = normalizeText(article.title)
    if (!titleNorm) continue
    const titleWords = tokenize(article.title)
    let allMatch = true
    for (const qt of qTokens) {
      const inTitle =
        titleNorm.includes(qt) || titleWords.some((w) => strongTokenMatch(qt, w))
      if (!inTitle) {
        allMatch = false
        break
      }
    }
    if (!allMatch) continue
    let score = qTokens.length * 15
    if (phrase.length >= 4 && titleNorm.includes(phrase)) score += 40
    const sectionTitle = getSectionTitleForPath(article.path)
    scored.push({ article, score, sectionTitle })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((x) => ({
    path: x.article.path,
    title: x.article.title,
    sectionTitle: x.sectionTitle,
  }))
}

/**
 * Подсказки с учетом title + aliases/keywords/searchTerms + path.
 * @param {Map<string, { md: string, article: { title: string, path: string } }>} docsMap
 * @param {string} query
 * @param {number} limit
 * @param {string | null} sectionRootPath
 */
export function suggestArticles(docsMap, query, limit = 6, sectionRootPath = null) {
  const qTokens = searchTokensFromQuery(query)
  if (!docsMap || qTokens.length === 0) return []
  /** @type {{ path: string, title: string, sectionTitle: string, score: number }[]} */
  const scored = []
  for (const [path, { md, article }] of docsMap) {
    if (sectionRootPath && !articleUnderSectionRoot(path, sectionRootPath)) continue
    if (sectionRootPath && path === sectionRootPath) continue
    if (isSectionRootPath(path)) continue
    const { meta, body } = parseSearchFrontmatter(md)
    const externalMeta = searchMetadataByPath[path] || {}
    const mergedMeta = {
      aliases: [...(meta.aliases || []), ...(externalMeta.aliases || [])],
      keywords: [...(meta.keywords || []), ...(externalMeta.keywords || [])],
      searchTerms: [...(meta.searchTerms || []), ...(externalMeta.searchTerms || [])],
    }
    const aliasText = [
      ...mergedMeta.aliases,
      ...mergedMeta.keywords,
      ...mergedMeta.searchTerms,
    ].join(' ')
    const titleWords = tokenizeForSearch(article.title)
    const aliasWords = tokenizeForSearch(aliasText)
    const pathWords = tokenizeForSearch(path.replace(/\//g, ' '))
    const phrase = normalizeText(qTokens.join(' ')).replace(/\s+/g, ' ').trim()
    const titleNorm = normalizeText(article.title)
    const aliasNorm = normalizeText(aliasText)

    let covered = 0
    let score = 0
    for (const qt of qTokens) {
      if (tokenMatchesSomeWord(qt, titleWords)) {
        score += 38
        covered++
      } else if (tokenMatchesSomeWord(qt, aliasWords)) {
        score += 28
        covered++
      } else if (tokenMatchesSomeWord(qt, pathWords)) {
        score += 20
        covered++
      }
    }
    if (covered === 0) continue
    if (phrase.length >= 4 && titleNorm.includes(phrase)) score += 90
    else if (phrase.length >= 4 && aliasNorm.includes(phrase)) score += 54
    if (covered === qTokens.length && qTokens.length > 1) score += 25
    // Небольшой бонус за наличие содержимого: выше "живые" статьи.
    if (body?.trim()) score += 4

    scored.push({
      path: article.path,
      title: article.title,
      sectionTitle: getSectionTitleForPath(article.path),
      score,
    })
  }
  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'ru'))
  return scored.slice(0, limit).map(({ score, ...rest }) => rest)
}
