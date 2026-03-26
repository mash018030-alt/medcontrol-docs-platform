/**
 * Разбивает admin/user-guide.md на подстатьи по заголовкам H1.
 * Переводит заголовки из КАПСЛОКА в обычный регистр (первая буква заглавная).
 * Запуск: node scripts/split-admin-guide.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const ADMIN_DIR = path.join(ROOT, 'docs-app/public/content/admin');

// Только первая буква заглавная, остальные строчные
function toTitleCase(str) {
  const s = str.trim();
  if (!s.length) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const SLUGS = {
  'РЕКОМЕНДАЦИЯ ПО ИСПОЛЬЗОВАНИЮ ИНСТРУКЦИИ': 'rekomendaciya-po-ispolzovaniyu-instrukcii',
  'ПОЛЬЗОВАТЕЛИ': 'polzovateli',
  'ОРГАНИЗАЦИИ': 'organizacii',
  'ОСМОТРЫ': 'osmotry',
  'ПАК': 'pak',
  'АДМИНПАНЕЛЬ': 'adminpanel',
  'ЧАСТЫЕ ВОПРОСЫ': 'chastye-voprosy',
};

function getSlug(h1Text) {
  const key = h1Text.trim().toUpperCase();
  return SLUGS[key] || key.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '');
}

function main() {
  const filePath = path.join(ADMIN_DIR, 'user-guide.md');
  const content = fs.readFileSync(filePath, 'utf8');

  // Все H1 в документе: либо после "* * *# ", либо в начале "# РЕКОМЕНДАЦИЯ..."
  const h1Pattern = /(?:^|\* \* \*)\s*# ([А-ЯA-ZЁ][А-ЯA-ZЁ\s]+?)(?=##|[\r\n]\s*[^\n#]|\* \* \*#|$)/gm;
  const matches = [];
  let m;
  while ((m = h1Pattern.exec(content)) !== null) {
    const titleRaw = m[1].trim();
    if (titleRaw === 'АДМИНИСТРИРОВАНИЕ. MC CLOUD. РУКОВОДСТВО ПОЛЬЗОВАТЕЛЯ') continue;
    matches.push({ index: m.index, titleRaw, fullLength: m[0].length });
  }

  const sections = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const contentStart = start + matches[i].fullLength;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
    let body = content.slice(contentStart, end).trim();
    const title = toTitleCase(matches[i].titleRaw);
    const slug = getSlug(matches[i].titleRaw);
    const fullContent = '# ' + title + '\n\n' + body;
    sections.push({ slug, title, content: fullContent });
  }

  if (sections.length === 0) {
    console.log('No H1 sections found. Trying alternative split...');
    // Альтернатива: разбить по * * *# ЗАГОЛОВОК
    const altRegex = /\* \* \*# ([А-ЯA-ZЁ][А-ЯA-ZЁ\s]+?)(?=##)/g;
    const altMatches = [];
    let alt;
    while ((alt = altRegex.exec(content)) !== null) {
      altMatches.push({ index: alt.index, titleRaw: alt[1].trim(), full: alt[0] });
    }
    let pos = content.indexOf('# РЕКОМЕНДАЦИЯ ПО ИСПОЛЬЗОВАНИЮ ИНСТРУКЦИИ');
    if (pos !== -1) {
      const recEnd = altMatches.length ? altMatches[0].index : content.length;
      let recBody = content.slice(pos + 43, recEnd).trim(); // 43 = length of "# РЕКОМЕНДАЦИЯ ПО ИСПОЛЬЗОВАНИЮ ИНСТРУКЦИИ"
      sections.push({
        slug: 'rekomendaciya-po-ispolzovaniyu-instrukcii',
        title: 'Рекомендация по использованию инструкции',
        content: '# Рекомендация по использованию инструкции\n\n' + recBody,
      });
    }
    for (let i = 0; i < altMatches.length; i++) {
      const start = altMatches[i].index + altMatches[i].full.length;
      const end = i + 1 < altMatches.length ? altMatches[i + 1].index : content.length;
      let body = content.slice(start, end).trim();
      const titleRaw = altMatches[i].titleRaw;
      const title = toTitleCase(titleRaw);
      const slug = getSlug(titleRaw);
      sections.push({ slug, title, content: '# ' + title + '\n\n' + body });
    }
  }

  for (const sec of sections) {
    const outPath = path.join(ADMIN_DIR, sec.slug + '.md');
    fs.writeFileSync(outPath, sec.content, 'utf8');
    console.log('Written:', sec.slug + '.md');
  }

  const indexLines = [
    '# Администрирование. MC Cloud. Руководство пользователя',
    '',
    ...sections.map((s) => `- [${s.title}](/admin/${s.slug})`),
    '',
  ];
  fs.writeFileSync(filePath, indexLines.join('\n'), 'utf8');
  console.log('Updated user-guide.md');

  return sections;
}

main();
