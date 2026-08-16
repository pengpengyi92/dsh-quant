/**
 * dsh-community 域手算测试：ossPulse 评分 + GitHub/npm 解析（纯函数，离线）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ossPulse } from '../src/dsh-community/pulse.ts'
import { parseRepoStats } from '../src/dsh-community/github.ts'
import { parseNpmStats } from '../src/dsh-community/npm.ts'

test('ossPulse: 新小仓库（3 星起步）→ C 56 分，两条增长建议', () => {
  const r = ossPulse({ stars: 3, downloadsWeekly: 0, openIssues: 0, openPullRequests: 0, daysSinceRelease: 1 })
  // s=10 d=10 m=50 h=100 f=100 → 0.2*10+0.15*10+0.25*50+0.2*100+0.2*100 = 56
  assert.equal(r.score, 56)
  assert.equal(r.grade, 'C')
  assert.deepEqual(r.components, { stars: 10, downloads: 10, momentum: 50, health: 100, freshness: 100 })
  assert.equal(r.suggestions.length, 2) // 星标基数 + npm 下载
  assert.ok(r.summary.startsWith('C 级（56/100）'))
})

test('ossPulse: 中型健康仓库（500 星、周更）→ B 73 分，无建议', () => {
  const r = ossPulse({
    stars: 500, downloadsWeekly: 5000, starsPrevious: 480,
    openIssues: 20, openPullRequests: 5, daysSinceRelease: 10,
  })
  // s=70（500 落在 500-999 档） d=50 m=70（+4.17%） h=100（25/500=0.05） f=70 → 14+7.5+17.5+20+14 = 73
  assert.equal(r.score, 73)
  assert.equal(r.grade, 'B')
  assert.equal(r.components.stars, 70)
  assert.equal(r.components.momentum, 70)
  assert.deepEqual(r.suggestions, ['各项指标健康，保持节奏 🐋'])
})

test('ossPulse: 大仓库缺上一期快照 → 增速中性 50', () => {
  const r = ossPulse({ stars: 1200, downloadsWeekly: 50000, openIssues: 5, daysSinceRelease: 3 })
  // s=85（1200 落在 500-4999 档） d=70 m=50 h=100 f=100 → 17+10.5+12.5+20+20 = 80 → A
  assert.equal(r.score, 80)
  assert.equal(r.grade, 'A')
  assert.equal(r.components.momentum, 50)
})

test('ossPulse: 失速 + 积压 + 停更 → D 28 分，四条建议', () => {
  const r = ossPulse({
    stars: 200, downloadsWeekly: 800, starsPrevious: 250,
    openIssues: 150, openPullRequests: 30, daysSinceRelease: 100,
  })
  // s=50 d=30 m=25（-20%） h=20（180/200=0.9） f=15 → 10+4.5+6.25+4+3 = 27.75 → 28
  assert.equal(r.score, 28)
  assert.equal(r.grade, 'D')
  assert.equal(r.suggestions.length, 4) // 增速 + 新鲜度 + 健康 + npm 下载
})

test('ossPulse: 只给星标（可选项全缺）→ 中性值不惩罚信息不足', () => {
  const r = ossPulse({ stars: 10 })
  // s=30 d=50 m=50 h=50 f=50 → 6+7.5+12.5+10+10 = 46 → C
  assert.equal(r.score, 46)
  assert.equal(r.grade, 'C')
  assert.equal(r.suggestions.length, 1) // 仅星标基数
})

test('ossPulse: 星标分档上界（>=5000 → 100）与新鲜度边界（<=7 → 100）', () => {
  const r = ossPulse({ stars: 9999, daysSinceRelease: 7 })
  // s=100 d=50 m=50 h=50 f=100 → 20+7.5+12.5+10+20 = 69.5 → 70 → B
  assert.equal(r.score, 70)
  assert.equal(r.grade, 'B')
  assert.equal(r.components.stars, 100)
  assert.equal(r.components.freshness, 100)
})

test('ossPulse: 星标增速 0 → 动量 40', () => {
  const r = ossPulse({ stars: 100, starsPrevious: 100, downloadsWeekly: 100 })
  // s=50 d=30 m=40 h=50 f=50 → 10+4.5+10+10+10 = 44.5 → 45 → C
  assert.equal(r.score, 45)
  assert.equal(r.components.momentum, 40)
})

test('ossPulse: 非法输入抛 RangeError', () => {
  assert.throws(() => ossPulse({ stars: -1 }), /stars/)
  assert.throws(() => ossPulse({ stars: 1, downloadsWeekly: -5 }), /downloadsWeekly/)
  assert.throws(() => ossPulse({ stars: 1, daysSinceRelease: -1 }), /daysSinceRelease/)
  assert.throws(() => ossPulse({ stars: Number.NaN }), /stars/)
})

test('parseRepoStats: 标准 fixture 全字段', () => {
  const r = parseRepoStats('pengpengyi92', 'dsh-quant',
    {
      stargazers_count: 3, forks_count: 0, subscribers_count: 1, open_issues_count: 9,
      language: 'TypeScript', topics: ['quant', 'dsh-plugin'],
      license: { spdx_id: 'MIT' }, description: 'quant toolkit',
      created_at: '2026-08-16T00:00:00Z', pushed_at: '2026-08-16T12:00:00Z',
    },
    [{}, {}],
    { tag_name: 'v0.16.0', published_at: '2026-08-16T10:00:00Z' },
  )
  assert.equal(r.stars, 3)
  assert.equal(r.forks, 0)
  assert.equal(r.watchers, 1)
  assert.equal(r.openIssues, 9)
  assert.equal(r.openPullRequests, 2)
  assert.equal(r.language, 'TypeScript')
  assert.deepEqual(r.topics, ['quant', 'dsh-plugin'])
  assert.equal(r.license, 'MIT')
  assert.equal(r.latestRelease, 'v0.16.0')
  assert.equal(r.url, 'https://github.com/pengpengyi92/dsh-quant')
})

test('parseRepoStats: 无 release / 无 license → null 降级', () => {
  const r = parseRepoStats('a', 'b',
    {
      stargazers_count: 1, forks_count: 0, subscribers_count: 0, open_issues_count: 0,
      language: null, topics: [], license: null, description: null,
      created_at: '2026-01-01T00:00:00Z', pushed_at: '2026-01-02T00:00:00Z',
    },
    [],
    { message: 'Not Found' },
  )
  assert.equal(r.latestRelease, null)
  assert.equal(r.latestReleaseAt, null)
  assert.equal(r.license, null)
  assert.equal(r.language, null)
  assert.equal(r.openPullRequests, 0)
})

test('parseRepoStats: 缺 stargazers_count → 抛错', () => {
  assert.throws(() => parseRepoStats('a', 'b', { forks_count: 0 }, [], null), /stargazers_count/)
})

test('parseNpmStats: 标准 fixture（周+月下载）', () => {
  const r = parseNpmStats('dsh-quant',
    {
      'dist-tags': { latest: '0.16.0' },
      description: 'quant tools', homepage: 'https://github.com/pengpengyi92/dsh-quant',
      time: { modified: '2026-08-16T00:00:00Z' },
    },
    { downloads: 1234 },
    { downloads: 5678 },
  )
  assert.equal(r.latest, '0.16.0')
  assert.equal(r.weeklyDownloads, 1234)
  assert.equal(r.monthlyDownloads, 5678)
  assert.equal(r.url, 'https://www.npmjs.com/package/dsh-quant')
})

test('parseNpmStats: 下载 API 404 → 周下载 0、月下载 null', () => {
  const r = parseNpmStats('new-pkg',
    { 'dist-tags': { latest: '0.1.0' }, time: { modified: '' } },
    null, null,
  )
  assert.equal(r.weeklyDownloads, 0)
  assert.equal(r.monthlyDownloads, null)
  assert.equal(r.description, null)
  assert.equal(r.homepage, null)
})
