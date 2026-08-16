/**
 * 生成 mcp/tools.json：boot 插件后从 ctx.tools.schemas() 提取全部工具的
 * 模型可见 schema（OpenAI/JSON-Schema 兼容），供其他 agent / MCP client 直接消费。
 *
 * 运行：npx tsx scripts/gen-tools-json.ts
 */
import { writeFileSync } from 'node:fs'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { apply } from '../src/index.ts'

const ctx = new Context()
await ctx.plugin(SystemPrompt)
await ctx.plugin(ToolRuntime)
await ctx.plugin({ name: 'dsh-quant', inject: ['tools'], apply })

const schemas = ctx.tools.schemas()
const tools = schemas.map(s => ({
  name: s.name,
  description: s.description,
  parameters: s.parameters ?? {},
}))
const manifest = {
  generator: 'scripts/gen-tools-json.ts',
  package: 'dsh-quant',
  generatedAt: new Date().toISOString(),
  toolCount: tools.length,
  note: 'Model-visible schemas extracted from ctx.tools.schemas() at runtime — always matches the shipped code.',
  tools,
}
writeFileSync(new URL('../mcp/tools.json', import.meta.url), JSON.stringify(manifest, null, 2) + '\n')
console.log(`generated mcp/tools.json with ${tools.length} tools`)
await ctx.fiber.dispose()
