/**
 * Одноразово: 9.png содержит прозрачные поля — на фоне карточки виден «вложенный» блок.
 * Обрезка по непрозрачной области + cover на 282×156 (как у соседних тайлов), без правок layout.
 */
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const TARGET_W = 282
const TARGET_H = 156
const ALPHA_MIN = 16

const srcPath = path.join(__dirname, '../public/content/images/dashboards/Obshee/9.png')

function bboxOpaque(png) {
  let x0 = png.width
  let y0 = png.height
  let x1 = -1
  let y1 = -1
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (png.width * y + x) << 2
      if (png.data[i + 3] > ALPHA_MIN) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < x0) throw new Error('empty image')
  return { x0, y0, x1, y1, cw: x1 - x0 + 1, ch: y1 - y0 + 1 }
}

function getRgba(png, x, y) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return [0, 0, 0, 0]
  const i = (png.width * y + x) << 2
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]]
}

function sampleBilinear(png, ax, ay) {
  const x0 = Math.floor(ax)
  const y0 = Math.floor(ay)
  const x1 = Math.min(x0 + 1, png.width - 1)
  const y1 = Math.min(y0 + 1, png.height - 1)
  const tx = ax - x0
  const ty = ay - y0
  const c = (i) => {
    const v00 = getRgba(png, x0, y0)[i]
    const v10 = getRgba(png, x1, y0)[i]
    const v01 = getRgba(png, x0, y1)[i]
    const v11 = getRgba(png, x1, y1)[i]
    const top = v00 + (v10 - v00) * tx
    const bot = v01 + (v11 - v01) * tx
    return Math.round(top + (bot - top) * ty)
  }
  return [c(0), c(1), c(2), c(3)]
}

function main() {
  const buf = fs.readFileSync(srcPath)
  const src = PNG.sync.read(buf)
  const b = bboxOpaque(src)
  const scale = Math.max(TARGET_W / b.cw, TARGET_H / b.ch)
  const sw = b.cw * scale
  const sh = b.ch * scale
  const ox = (TARGET_W - sw) / 2
  /* Нижнее выравнивание: в 9.png персонаж в нижней части кадра — не обрезать «по центру» */
  const oy = TARGET_H - sh

  const out = new PNG({ width: TARGET_W, height: TARGET_H, fill: true })
  out.data.fill(0)

  for (let y = 0; y < TARGET_H; y++) {
    for (let x = 0; x < TARGET_W; x++) {
      const sx = (x - ox) / scale
      const sy = (y - oy) / scale
      const i = (TARGET_W * y + x) << 2
      if (sx < 0 || sy < 0 || sx > b.cw - 1 || sy > b.ch - 1) continue
      const ax = b.x0 + sx
      const ay = b.y0 + sy
      const [r, g, bv, a] = sampleBilinear(src, ax, ay)
      out.data[i] = r
      out.data[i + 1] = g
      out.data[i + 2] = bv
      out.data[i + 3] = a
    }
  }

  let written = PNG.sync.read(PNG.sync.write(out))
  // Закрыть редкие полупрозрачные углы после cover
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < TARGET_H; y++) {
      for (let x = 0; x < TARGET_W; x++) {
        const i = (TARGET_W * y + x) << 2
        if (written.data[i + 3] < 128) {
          let best = null
          let bd = 99
          for (let dy = -6; dy <= 6; dy++) {
            for (let dx = -6; dx <= 6; dx++) {
              const nx = x + dx
              const ny = y + dy
              if (nx < 0 || ny < 0 || nx >= TARGET_W || ny >= TARGET_H) continue
              const j = (TARGET_W * ny + nx) << 2
              if (written.data[j + 3] > 200) {
                const d = dx * dx + dy * dy
                if (d < bd) {
                  bd = d
                  best = j
                }
              }
            }
          }
          if (best != null) {
            written.data[i] = written.data[best]
            written.data[i + 1] = written.data[best + 1]
            written.data[i + 2] = written.data[best + 2]
            written.data[i + 3] = 255
          }
        }
      }
    }
  }
  fs.writeFileSync(srcPath, PNG.sync.write(written))
  // eslint-disable-next-line no-console
  console.log('wrote', srcPath, 'from crop', b, 'scale', scale.toFixed(4))
}

main()
