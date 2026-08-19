#!/usr/bin/env node
/**
 * dsh-quant browse — 交互式 TUI（零依赖，Node 原生 readline 手搓）。
 *
 * 浏览 quant-history 的 53 家机构档案：
 *   ↑↓ 移动 · Enter 查看 · / 搜索（实时过滤）· Esc 清空 · q 退出
 * 查看模式：↑↓/j k 滚动 · PgUp/PgDn 翻页 · q/Esc 返回列表
 *
 * 非交互终端（无 TTY）自动回退到静态索引。
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const HISTORY_DIR = join(ROOT, 'quant-history')
const REPORTS = ['ANALYSIS', 'TIMELINE', 'LINEAGE', 'BANK_LINEAGE', 'DD_STANDARD']

// ---------- ANSI ----------
const A = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', invert: '\x1b[7m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', magenta: '\x1b[35m',
}
const paint = (color, text) => `${A[color]}${text}${A.reset}`
const HOME = '\x1b[H'
const CLEAR = '\x1b[2J' + HOME
const HIDE_CURSOR = '\x1b[?25l'
const SHOW_CURSOR = '\x1b[?25h'

// ---------- 中文宽度感知（TUI 的灵魂：中文占 2 个终端列） ----------
function charWidth(ch) {
  const code = ch.codePointAt(0)
  if (code < 0x20 || (code >= 0x7f && code < 0xa0)) return 0
  if (
    (code >= 0x1100 && code <= 0x115f) ||
    (code >= 0x2e80 && code <= 0xa4cf) ||
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xfe30 && code <= 0xfe4f) ||
    (code >= 0xff00 && code <= 0xff60) ||
    (code >= 0x1f300 && code <= 0x1faff)
  ) {
    return 2
  }
  return 1
}
const displayWidth = (s) => [...s].reduce((w, ch) => w + charWidth(ch), 0)
const padTo = (s, width) => s + ' '.repeat(Math.max(0, width - displayWidth(s)))
function truncTo(s, width) {
  let out = ''
  let w = 0
  for (const ch of s) {
    const cw = charWidth(ch)
    if (w + cw > width) break
    out += ch
    w += cw
  }
  return out + ' '.repeat(Math.max(0, width - w))
}

// ---------- 数据 ----------
function listArchives(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !/^(README|ROADMAP)/.test(f))
    .filter((f) => !REPORTS.includes(f.replace('.md', '')))
    .sort()
}
function firstHeading(file) {
  const md = readFileSync(file, 'utf8')
  const match = md.match(/^# (.+)$/m)
  return match ? match[1].trim() : '(无标题)'
}
function renderMd(md) {
  const out = []
  for (const raw of md.split('\n')) {
    const line = raw.replace(/\*\*(.+?)\*\*/g, (_, t) => paint('bold', t))
    if (line.startsWith('### ')) out.push(` ${paint('bold', paint('yellow', line.slice(4)))}`)
    else if (line.startsWith('## ')) out.push(`\n${paint('bold', paint('cyan', '▍' + line.slice(3)))}`)
    else if (line.startsWith('# ')) out.push(`\n${paint('bold', paint('magenta', line.slice(2)))}\n`)
    else if (line.startsWith('> ')) out.push(paint('dim', '  ' + line.slice(2)))
    else if (line.startsWith('- ')) out.push(`  ${paint('dim', '•')} ${line.slice(2)}`)
    else out.push(line)
  }
  return out.join('\n')
}

// ---------- 状态 ----------
const WIDTH = 82
const INNER = WIDTH - 2

function makeFrame(topTitle, bodyLines, footerLines) {
  const h = paint('cyan', '─')
  const v = paint('cyan', '│')
  const lines = []
  lines.push(paint('cyan', '┌') + paint('bold', paint('cyan', truncTo(` ${topTitle} `, INNER).trimEnd().padEnd(INNER, '─').slice(0, INNER))).replace(/^\x1b\[1m/, '') + paint('cyan', '┐'))
  // simpler: draw title line manually
  lines[0] = paint('cyan', '┌') + paint('bold', ` ${topTitle} `) + paint('cyan', '─'.repeat(Math.max(0, INNER - displayWidth(` ${topTitle} `) - 2) + 2)) + paint('cyan', '┐')
  for (const body of bodyLines) {
    const plain = body.replace(/\x1b\[[0-9;]*m/g, '')
    lines.push(v + padTo(body, INNER) + v)
  }
  for (const footer of footerLines) {
    const plain = footer.replace(/\x1b\[[0-9;]*m/g, '')
    lines.push(v + padTo(footer, INNER) + v)
  }
  lines.push(paint('cyan', '└') + paint('cyan', '─'.repeat(INNER)) + paint('cyan', '┘'))
  return lines
}

function listView(firms, selected, filter, termHeight) {
  const title = `dsh-quant · quant-history ${filter ? `(匹配 ${firms.length})` : `(${firms.length} 家)`}`
  const body = []
  const listHeight = Math.max(4, termHeight - 6)
  const start = Math.max(0, selected - Math.floor(listHeight / 2))
  const windowFirms = firms.slice(start, start + listHeight)
  for (let i = 0; i < windowFirms.length; i++) {
    const firm = windowFirms[i]
    const realIndex = start + i
    const name = firm.replace('.md', '')
    const title = firstHeading(join(HISTORY_DIR, firm))
    const isSelected = realIndex === selected
    let line = `  ${isSelected ? paint('green', '▸') : ' '} ${truncTo(name, 16)} ${truncTo(title, INNER - 24)}`
    if (isSelected) line = paint('invert', padTo(line, INNER))
    body.push(line)
  }
  for (let i = windowFirms.length; i < listHeight; i++) body.push('')
  const footer = filter !== null && filter !== ''
    ? `${paint('yellow', '搜索:')} ${filter}${paint('dim', '_')}`
    : paint('dim', ' ↑↓ 移动 · Enter 查看 · / 搜索 · Esc 清空 · q 退出')
  return makeFrame(title, body, [footer])
}

function pagerView(lines, offset, termHeight) {
  const title = 'quant-history · 档案阅读'
  const body = []
  const pageHeight = Math.max(4, termHeight - 5)
  const windowLines = lines.slice(offset, offset + pageHeight)
  for (let i = 0; i < windowLines.length; i++) body.push(' ' + windowLines[i].slice(0, INNER - 2))
  for (let i = windowLines.length; i < pageHeight; i++) body.push('')
  const progress = lines.length ? `${Math.min(offset + pageHeight, lines.length)}/${lines.length}` : '0/0'
  const footer = `${paint('dim', ` ↑↓/jk 滚动 · PgUp/PgDn 翻页 · q 返回列表`)}  ${paint('yellow', progress)}`
  return makeFrame(title, body, [footer])
}

function draw(lines) {
  process.stdout.write(CLEAR + lines.join('\n') + '\n')
}

function getTermHeight() {
  return Math.max(10, Math.min(40, process.stdout.rows || 24))
}

// ---------- 主循环 ----------
export async function browse() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.log(paint('yellow', '⚠ 非交互终端：browse 需要 TTY（真实终端）。回退到静态索引：'))
    console.log('')
    const { execSync } = await import('node:child_process')
    execSync(`node ${join(ROOT, 'cli/main.mjs')} history`, { stdio: 'inherit' })
    return
  }

  const firms = listArchives(HISTORY_DIR)
  let selected = 0
  let filter = ''
  let mode = 'list' // 'list' | 'filter' | 'pager'
  let pagerLines = []
  let pagerOffset = 0

  const filtered = () => {
    if (!filter) return firms
    const kw = filter.toLowerCase()
    return firms.filter((f) => {
      const md = readFileSync(join(HISTORY_DIR, f), 'utf8').toLowerCase()
      return f.includes(kw) || md.includes(kw)
    })
  }

  const render = () => {
    const height = getTermHeight()
    if (mode === 'pager') {
      draw(pagerView(pagerLines, pagerOffset, height))
    } else {
      const list = filtered()
      if (selected >= list.length) selected = Math.max(0, list.length - 1)
      draw(listView(list, selected, filter, height))
    }
  }

  process.stdout.write(HIDE_CURSOR)
  readline.emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)
  const keypress = (str, key) => {
    if (key.ctrl && key.name === 'c') return exit()
    if (mode === 'pager') {
      const page = Math.max(4, getTermHeight() - 5)
      if (key.name === 'up' || str === 'k') pagerOffset = Math.max(0, pagerOffset - 1)
      else if (key.name === 'down' || str === 'j') pagerOffset = Math.min(Math.max(0, pagerLines.length - page), pagerOffset + 1)
      else if (key.name === 'pageup') pagerOffset = Math.max(0, pagerOffset - page)
      else if (key.name === 'pagedown') pagerOffset = Math.min(Math.max(0, pagerLines.length - page), pagerOffset + page)
      else if (key.name === 'escape' || str === 'q') { mode = 'list'; pagerLines = [] }
      else return
      render()
      return
    }
    if (mode === 'filter') {
      if (key.name === 'return') { mode = 'list' }
      else if (key.name === 'escape') { filter = ''; mode = 'list' }
      else if (key.name === 'backspace') filter = filter.slice(0, -1)
      else if (str && str.length === 1 && !key.ctrl && !key.meta) filter += str
      selected = 0
      render()
      return
    }
    // list mode
    const list = filtered()
    if (key.name === 'up') selected = Math.max(0, selected - 1)
    else if (key.name === 'down') selected = Math.min(list.length - 1, selected + 1)
    else if (key.name === 'return' && list.length) {
      const firm = list[selected]
      mode = 'pager'
      pagerOffset = 0
      pagerLines = renderMd(readFileSync(join(HISTORY_DIR, firm), 'utf8')).split('\n')
    } else if (str === '/') { mode = 'filter'; filter = '' }
    else if (key.name === 'escape') filter = ''
    else if (str === 'q') return exit()
    else return
    render()
  }
  const exit = () => {
    process.stdin.removeListener('keypress', keypress)
    process.stdin.setRawMode(false)
    process.stdout.write(SHOW_CURSOR + '\x1b[0m\n')
    process.exit(0)
  }

  process.stdin.on('keypress', keypress)
  render()
}

// 允许 node cli/tui.mjs 直接运行
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  browse()
}
