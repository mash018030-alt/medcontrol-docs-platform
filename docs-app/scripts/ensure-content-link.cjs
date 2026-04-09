/**
 * Связывает docs-app/public/content → корневой каталог content/ репозитория.
 * Нужен для Vite (URL /content/…). На Windows — junction, на Unix — symlink на каталог.
 * Запуск: postinstall, predev, prebuild (см. package.json).
 */
const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '../..')
const contentRoot = path.join(repoRoot, 'content')
const linkPath = path.join(__dirname, '../public/content')

function resolveTarget(p) {
  try {
    return fs.realpathSync(p)
  } catch {
    return path.resolve(p)
  }
}

function pointsToContentRoot() {
  if (!fs.existsSync(linkPath)) return false
  const st = fs.lstatSync(linkPath)
  if (st.isSymbolicLink()) {
    const t = fs.readlinkSync(linkPath)
    return resolveTarget(path.resolve(path.dirname(linkPath), t)) === resolveTarget(contentRoot)
  }
  if (process.platform === 'win32' && st.isDirectory()) {
    try {
      return resolveTarget(linkPath) === resolveTarget(contentRoot)
    } catch {
      return false
    }
  }
  return false
}

function main() {
  if (!fs.existsSync(contentRoot)) {
    console.error('ensure-content-link: нет каталога', contentRoot)
    process.exit(1)
  }

  if (pointsToContentRoot()) {
    return
  }

  if (fs.existsSync(linkPath)) {
    const st = fs.lstatSync(linkPath)
    if (st.isDirectory() && !st.isSymbolicLink()) {
      console.error(
        'ensure-content-link: уже есть обычная папка',
        linkPath,
        '— удалите её вручную (должна быть ссылка на',
        contentRoot + ')',
      )
      process.exit(1)
    }
    fs.rmSync(linkPath, { recursive: true, force: true })
  }

  fs.mkdirSync(path.dirname(linkPath), { recursive: true })

  const absContent = path.resolve(contentRoot)
  try {
    if (process.platform === 'win32') {
      fs.symlinkSync(absContent, linkPath, 'junction')
    } else {
      fs.symlinkSync(absContent, linkPath, 'dir')
    }
  } catch (e) {
    console.error('ensure-content-link: не удалось создать ссылку:', e.message)
    process.exit(1)
  }
  console.log('ensure-content-link:', linkPath, '→', absContent)
}

main()
