import fs from 'node:fs'
import path from 'node:path'

const slidesDir = path.resolve('./pages/lyrics')
if (!fs.existsSync(slidesDir)) {
  console.warn('slides 目錄不存在，跳過 anchor map 建立')
  process.exit(0)
}

// 取得所有 md 檔案
const files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.md'))

const anchorMap = {} // id -> page (1-based)
let totalAnchors = 0

files.forEach(file => {
  const entry = path.join(slidesDir, file)
  const text = fs.readFileSync(entry, 'utf-8')
  const withoutHead = text.replace(/^---[\s\S]*?---\s*/, '')
  const slides = withoutHead.split(/\n---\n/).map(s => s.trim())

  slides.forEach((slide, idx) => {
    const page = idx + 1
    const ids = new Set()
    for (const m of slide.matchAll(/<a\s+[^>]*id="([^"]+)"[^>]*>/g)) ids.add(m[1])
    for (const m of slide.matchAll(/<h[1-6]\s+[^>]*id="([^"]+)"[^>]*>/g)) ids.add(m[1])
    for (const m of slide.matchAll(/^\s{0,3}#{1,6}.*\{#([A-Za-z0-9\-_]+)\}\s*$/gm)) ids.add(m[1])
    ids.forEach(id => { anchorMap[id] = page })
    totalAnchors += ids.size
  })
})

// 確保 public 存在
const pubDir = path.resolve('public')
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir)
fs.writeFileSync(path.join(pubDir, 'anchor-map.json'), JSON.stringify(anchorMap, null, 2))
console.log('已建立 public/anchor-map.json，共', totalAnchors, '個錨點')