/**
 * Разбивает obshee/user-guide.md на подстатьи по заголовкам первого уровня
 * (АВТОРИЗАЦИЯ В АРМ, ОСМОТРЫ, ОРГАНИЗАЦИИ, ПОЛЬЗОВАТЕЛИ, ДОКУМЕНТЫ, ОТЧЁТЫ, ПАК, УВЕДОМЛЕНИЯ, ЧАСТЫЕ ВОПРОСЫ).
 * Заголовки переводятся в обычный регистр (первая буква заглавная).
 * Запуск: node scripts/split-obshee-guide.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const OBSHEE_DIR = path.join(ROOT, 'docs-app/public/content/obshee');

function toTitleCase(str) {
  const s = str.trim();
  if (!s.length) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const TITLE_TO_SLUG = {
  'АВТОРИЗАЦИЯ В АРМ': 'avtorizaciya-v-arm',
  'ОСМОТРЫ': 'osmotry',
  'ОРГАНИЗАЦИИ': 'organizacii',
  'ПОЛЬЗОВАТЕЛИ': 'polzovateli',
  'ДОКУМЕНТЫ': 'dokumenty',
  'ОТЧЁТЫ': 'otchety',
  'ПАК': 'pak',
  'УВЕДОМЛЕНИЯ': 'uvedomleniya',
  'ЧАСТЫЕ ВОПРОСЫ': 'chastye-voprosy',
};

const TITLE_DISPLAY = {
  'АВТОРИЗАЦИЯ В АРМ': 'Авторизация в АРМ',
  ПАК: 'ПАК',
};

function getDisplayTitle(titleRaw) {
  const key = titleRaw.trim().toUpperCase().replace(/\s+/g, ' ');
  return TITLE_DISPLAY[key] || toTitleCase(titleRaw);
}

function getSlug(titleRaw) {
  const key = titleRaw.trim().toUpperCase().replace(/\s+/g, ' ');
  return TITLE_TO_SLUG[key] || key.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '');
}

function main() {
  const filePath = path.join(OBSHEE_DIR, 'user-guide.md');
  let content = fs.readFileSync(filePath, 'utf8');

  // Убираем главный заголовок "# Общее. MC Cloud..." в начале, чтобы первый раздел начинался с ## АВТОРИЗАЦИЯ
  content = content.replace(/^# Общее\. MC Cloud\. Руководство пользователя\s*\n\n/, '');

  // Первый раздел может содержать неразрывный пробел (В АРМ); остальные — * * *# ЗАГОЛОВОК
  const sectionPattern = /(## АВТОРИЗАЦИЯ В\s*АРМ|\* \* \*# ОСМОТРЫ|\* \* \*# ОРГАНИЗАЦИИ|\* \* \*# ПОЛЬЗОВАТЕЛИ|\* \* \*# ДОКУМЕНТЫ|\* \* \*# ОТЧЁТЫ|\* \* \*# ПАК|\* \* \*# УВЕДОМЛЕНИЯ|\* \* \*# ЧАСТЫЕ ВОПРОСЫ)/g;
  const matches = [];
  let m;
  while ((m = sectionPattern.exec(content)) !== null) {
    const full = m[0];
    const titleRaw = full.replace(/^## |^\* \* \*# /, '').replace(/\s+/g, ' ').trim();
    matches.push({ index: m.index, full, titleRaw });
  }

  if (matches.length === 0) {
    console.error('Не найдены разделы первого уровня.');
    process.exit(1);
  }

  const sections = [];
  for (let i = 0; i < matches.length; i++) {
    const contentStart = matches[i].index + matches[i].full.length;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
    let body = content.slice(contentStart, end).trim();
    const titleRaw = matches[i].titleRaw;
    const title = getDisplayTitle(titleRaw);
    const slug = getSlug(titleRaw);
    const fullContent = '# ' + title + '\n\n' + body;
    sections.push({ slug, title, content: fullContent });
  }

  for (const sec of sections) {
    const outPath = path.join(OBSHEE_DIR, sec.slug + '.md');
    fs.writeFileSync(outPath, sec.content, 'utf8');
    console.log('Written:', sec.slug + '.md');
  }

  const indexLines = [
    '# Общее. MC Cloud. Руководство пользователя',
    '',
    ...sections.map((s) => `- [${s.title}](/obshee/${s.slug})`),
    '',
  ];
  fs.writeFileSync(filePath, indexLines.join('\n'), 'utf8');
  console.log('Updated user-guide.md (index with links)');

  return sections;
}

main();
