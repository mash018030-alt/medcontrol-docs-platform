/**
 * 9.png (FAQ): в нижней части кадра по краям много «пустого» почти белого —
 * обрезка колонок с долей near-white > порога и растяжение на 282px.
 * Запуск: npm run obshee-9:normalize-width
 */
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const W = 282
const H = 156
const Y0 = Math.floor(H * 0.12)
/* Для иллюстрации с большими боковыми полями можно снизить (напр. 0.78); для нового 9.png из макета обычно 0.88 */
const WHITE_FRAC_THR = 0.88
const srcPath = path.join(__dirname, '../public/content/images/dashboards/Obshee/9.png')

function nearWhiteAt(png, idx) {
  const r = png.data[idx]
  const g = png.data[idx + 1]
  const b = png.data[idx + 2]
  const a = png.data[idx + 3]
  return a > 200 && r > 248 && g > 248 && b > 252
}

function getRgba(png, fx, fy) {
  if (fx < 0 || fy < 0 || fx >= png.width - 1 || fy >= png.height - 1) return [252, 252, 254, 255]
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const x1 = Math.min(x0 + 1, png.width - 1)
  const y1 = Math.min(y0 + 1, png.height - 1)
  const tx = fx - x0
  const ty = fy - y0
  const p = (x, y, c) => png.data[((png.width * y + x) << 2) + c]
  const sample = (c) => {
    const v00 = p(x0, y0, c)
    const v10 = p(x1, y0, c)
    const v01 = p(x0, y1, c)
    const v11 = p(x1, y1, c)
    const top = v00 + (v10 - v00) * tx
    const bot = v01 + (v11 - v01) * tx
    return Math.round(top + (bot - top) * ty)
  }
  return [sample(0), sample(1), sample(2), sample(3)]
}

function main() {
  const src = PNG.sync.read(fs.readFileSync(srcPath))
  if (src.width !== W || src.height !== H) {
    throw new Error(`expected ${W}x${H}`)
  }
  const colFrac = []
  for (let x = 0; x < W; x++) {
    let w = 0
    let t = 0
    for (let y = Y0; y < H; y++) {
      t++
      const i = (W * y + x) << 2
      if (nearWhiteAt(src, i)) w++
    }
    colFrac.push(w / t)
  }
  let x0 = 0
  let x1 = W - 1
  while (x0 < W && colFrac[x0] >= WHITE_FRAC_THR) x0++
  while (x1 >= 0 && colFrac[x1] >= WHITE_FRAC_THR) x1--
  const cw = x1 - x0
  if (cw < 40) throw new Error('crop too narrow; check asset')

  const out = new PNG({ width: W, height: H })
  for (let oy = 0; oy < H; oy++) {
    for (let ox = 0; ox < W; ox++) {
      const t = ox / (W - 1)
      const sx = x0 + t * cw
      const [r, g, b, a] = getRgba(src, sx, oy)
      const i = (W * oy + ox) << 2
      out.data[i] = r
      out.data[i + 1] = g
      out.data[i + 2] = b
      out.data[i + 3] = a
    }
  }
  fs.writeFileSync(srcPath, PNG.sync.write(out))
  // eslint-disable-next-line no-console
  console.log('wrote', srcPath, 'crop x', x0, '..', x1, 'span', cw + 1)
}

main()
