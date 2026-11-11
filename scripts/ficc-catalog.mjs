import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const sections = [
  ['rates-credit', '利率、债券、信用、曲线与约定'],
  ['derivatives', '跨资产衍生品、数值方法与风险'],
  ['fx', 'FX 研究、数据与交易成本分析'],
  ['commodities-futures', '商品期货、执行研究、能源基本面与数据工程'],
  ['macro-data', '宏观、央行及跨资产数据'],
  ['learning-legacy', '教学、naive baseline 与历史研究参考'],
  ['restricted-license', '单独标识：source-available / 许可待确认'],
]

export function validateCatalog(catalog) {
  assert.equal(catalog.schema_version, 'dsh-quant.ficc-resources.v1')
  assert.match(catalog.observed_at, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(catalog.validation, 'METADATA_REVIEWED_NOT_EXECUTED')
  assert.ok(Array.isArray(catalog.resources) && catalog.resources.length > 0)
  const ids = new Set()
  const repos = new Set()
  for (const record of catalog.resources) {
    for (const field of ['id', 'name', 'repo', 'url', 'category', 'section', 'rationale', 'license', 'license_class', 'source_url', 'observed_at', 'validation', 'maturity', 'notes']) {
      assert.ok(typeof record[field] === 'string' && record[field].trim(), `${record.id}: missing ${field}`)
    }
    assert.match(record.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.match(record.repo, /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/)
    assert.equal(record.url, `https://github.com/${record.repo}`)
    const primary = new URL(record.source_url)
    const repoPath = `/${record.repo}`.toLowerCase()
    assert.ok(primary.protocol === 'https:' && primary.hostname === 'github.com' && !primary.username && !primary.password &&
      (primary.pathname.toLowerCase() === repoPath || primary.pathname.toLowerCase().startsWith(`${repoPath}/`)),
    `${record.id}: primary source must belong to its repo`)
    assert.equal(typeof record.archived, 'boolean')
    assert.equal(record.validation, 'METADATA_REVIEWED_NOT_EXECUTED')
    assert.match(record.observed_at, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(sections.some(([key]) => record.section === key), `${record.id}: invalid section`)
    assert.ok(['OPEN_SOURCE', 'SOURCE_AVAILABLE', 'UNRESOLVED'].includes(record.license_class))
    if (record.license_class !== 'OPEN_SOURCE') {
      assert.equal(record.section, 'restricted-license', `${record.id}: restricted license must stay separate`)
    }
    assert.ok(!ids.has(record.id), `duplicate id: ${record.id}`)
    assert.ok(!repos.has(record.repo.toLowerCase()), `duplicate repository: ${record.repo}`)
    ids.add(record.id)
    repos.add(record.repo.toLowerCase())
  }
  return catalog
}

const cell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
const base = 'https://github.com/pengpengyi92/dsh-quant'
const history = `- [利率债 #124](${base}/discussions/124) · [信用债 #125](${base}/discussions/125)
- [FX #126](${base}/discussions/126) · [贵金属 #127](${base}/discussions/127)
- [宏观框架 #128](${base}/discussions/128) · [Rates Bond Quant 联动 #129](${base}/discussions/129)
- [已有 quant_bond 工具的历史公告 #14](${base}/issues/14)
`

export function renderDirectory(catalog, community) {
  validateCatalog(catalog)
  assert.match(community.discussion_url, /^https:\/\/github\.com\/pengpengyi92\/dsh-quant\/discussions\/\d+$/)
  assert.match(community.intake_issue_url, /^https:\/\/github\.com\/pengpengyi92\/dsh-quant\/issues\/\d+$/)
  const count = catalog.resources.length
  let md = `# FICC · Fixed Income, Currencies & Commodities\n\n`
  md += `欢迎成熟项目、教学项目、naive baseline 和早期想法。这里汇总 FICC 相关的公开代码、\n数据入口和研究工程资源；代码许可、数据权限、项目阶段与验证状态分别记录。\n\n`
  md += `- **集中回复 / 评分 / 复现交流**：[FICC Discussion](${community.discussion_url})\n`
  md += `- **投稿 / 收录状态**：[长期征集 Issue](${community.intake_issue_url})；也可使用 [投稿模板](${base}/issues/new?template=ficc_resource.yml) 或直接 PR。\n`
  md += `- **可版本化目录**：[resources.json](resources.json)；[投稿、评分与每周收录规则](CONTRIBUTING.md)。\n\n`
  md += `本次观察日期 **${catalog.observed_at}**，首批 **${count} 个去重后的仓库引用**，包含\n绑定/配套示例；不等同于 ${count} 个独立定价引擎，也不声称穷尽所有 FICC 项目。\n全部仅完成 primary repo/README/许可说明核验，**未安装、未运行、未验证数值或数据质量**。\n每条的观察日期、原始分类、GitHub archived 标志与已知限制保存在 JSON。\n\n`
  md += `## 从一个具体问题开始\n\n- 债券/信用与定价架构：QuantLib、ORE、Strata、FinancePy；曲线小例子可从 bond_pricing、Nelson–Siegel–Svensson 开始。\n- FX 数据/研究/成本：findatapy、finmarketpy、tcapy；先明确货币对、报价方向、时区、bid/ask 与数据权限。\n- 商品期货：pysystemtrade、vn.py、NautilusTrader、LEAN；先明确主力/连续合约、换月、乘数与交易日历。\n- 宏观/利率数据：fredapi、SDMX、AKShare；先核对发布时间、vintage/revision、期限、单位和授权。\n- 电力商品邻接研究：GridStatus、PyPSA、oemof-solph；能源系统优化不能直接视为可交易收益证据。\n\n这只是按任务找入口的导航，未给项目预填质量分或“生产可用”结论。\n\n`
  for (const [key, title] of sections) {
    const entries = catalog.resources.filter((item) => item.section === key)
    if (!entries.length) continue
    md += `## ${title}\n\n| 项目 / primary source | FICC 用途 | 代码许可 | 阶段 / 限制 |\n|---|---|---|---|\n`
    for (const r of entries) {
      md += `| [${cell(r.name)}](${r.url}) · [source](${r.source_url}) | ${cell(r.rationale)} | ${cell(r.license)} | ${cell(r.maturity)}${r.archived ? '; ARCHIVED' : ''} — ${cell(r.notes)} |\n`
    }
    md += '\n'
  }
  md += `## 已有 FICC 讨论与本仓库工具\n\n这些是历史教学/研究讨论，独立于这次 repo 目录收录，不把旧帖内容当作新的数值验收。\n\n${history}\n`
  md += `本仓库已有 [quant_bond](../src/dsh-risk/bond.ts) 的债券价格/YTM、久期、凸性、DV01 教学方法，\n以及数据渠道知识库中的 ChinaBond、CFETS 等引用。本次没有新增 FICC 定价工具或自动交易功能。\n\n`
  if (community.scheduler === 'CODEX_WEEKLY_HEARTBEAT_ACTIVE') {
    md += `投稿巡检已安排每周一 09:30（Asia/Shanghai）的 Codex 线程跟进；运行依赖客户端与连接可用。\n巡检发现新内容后仍需 review/CI 通过再合入，未配置无人值守自动 merge。\n\n`
  }
  md += `## 收录与验证边界\n\n- 原仓库/官方文档是来源；收录不代表作者背书、dsh 插件兼容、模型验证或已完成集成。\n- source-available、许可未知、历史/archived 项目都有明确标签；请按具体代码版本核对许可。\n- SDK 开源不代表市场数据免费；商业 API、交易所授权、凭据、服务条款和再分发权单独确认。\n- 学习实验也欢迎。定价比较至少固定曲线、日计数、日历、复利、结算、clean/dirty、单位及已知答案；\n  回测须核对无未来函数、数据修订、换月、bid/ask、费用和风险。\n- 每个 repo 在 Discussion 留一个顶层评论，回复、评分和争议都放在它的回复下。\n  投稿 Issue 只跟踪 submitted → needs-info/reviewed → PR → merged → credited。\n- 每周批量检查、review 后合入；无人值守 merge 尚未配置。未运行的数值可靠性评分填 N/A。\n\n目录由 \`resources.json\` 生成。修改数据后运行 \`node scripts/ficc-catalog.mjs --write\`，\n再运行 \`npm run test:ficc\`；生成器离线运行，不访问或修改 GitHub。\n`
  return md
}

export function renderDiscussion(catalog, community) {
  const directory = renderDirectory(catalog, community)
    .replaceAll('(resources.json)', `(${base}/blob/master/ficc/resources.json)`)
    .replaceAll('(CONTRIBUTING.md)', `(${base}/blob/master/ficc/CONTRIBUTING.md)`)
    .replaceAll('(../src/dsh-risk/bond.ts)', `(${base}/blob/master/src/dsh-risk/bond.ts)`)
  return `欢迎大家把 FICC relevant repo 放到这里！成熟的、naive 的、教学的、实验阶段的都可以。\n\n` +
    `**这里是集中讨论区**：回复、比较、评分和复现经验放在本帖，每个 repo 一个顶层评论。\n` +
    `**Issue 用于投稿与跟踪**：[征集入口](${community.intake_issue_url})；接受目录 PR，审核后定期合入 FICC 板块。\n\n` +
    `评分可用 FICC关联度 / 可复现性 / 数值方法 / 文档 / 工程维护五维 0–5 或 N/A；\n未运行请写 NOT_RUN，给出版本、命令、结果、限制和利益关联。👍 表示兴趣，不能当质量认证。\n\n---\n\n` + directory
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const catalog = JSON.parse(readFileSync(resolve(root, 'ficc/resources.json'), 'utf8'))
  const community = JSON.parse(readFileSync(resolve(root, 'ficc/community.json'), 'utf8'))
  const files = [
    ['ficc/README.md', renderDirectory(catalog, community)],
    ['ficc/DISCUSSION.md', renderDiscussion(catalog, community)],
  ]
  for (const [name, text] of files) {
    if (process.argv.includes('--write')) writeFileSync(resolve(root, name), text)
    else assert.equal(readFileSync(resolve(root, name), 'utf8').replaceAll('\r\n', '\n'), text, `${name} is stale; run --write`)
  }
  console.log(`FICC catalog: ${catalog.resources.length} unique records; directory and Discussion ${process.argv.includes('--write') ? 'generated' : 'consistent'}`)
}
