/**
 * ML 工作流 demo（可执行）：真实数据 → 特征工程 → 中性化 → 线性模型 →
 * walk-forward → 结论。PCPT 承诺的「demo」载体。
 *
 * 运行：npx tsx demos/ml-workflow.ts
 */
import { fetchKlines } from '../src/dsh-data/market.js'
import { factorNeutralize } from '../src/dsh-alpha/factor.js'
import { fitLinearModel, predictLinearModel, evaluatePredictions } from '../src/dsh-ml/linear.js'
import { walkForward } from '../src/dsh-ml/walkforward.js'

async function main() {
  // 1) 数据：BTC 日线（三所容错）
  let candles
  for (const provider of ['binance', 'okx', 'bybit'] as const) {
    try {
      candles = await fetchKlines('BTCUSDT', '1d', 200, new AbortController().signal, provider)
      console.log(`data: BTCUSDT 1d x${candles.length} via ${provider}`)
      break
    } catch (err) {
      console.log(`provider ${provider} failed: ${(err as Error).message}`)
    }
  }
  if (!candles || candles.length < 60) throw new Error('no usable candles')

  // 2) 特征：动量（12 日）与短期反转（5 日）
  const close = candles.map(c => c.close)
  const ret = close.slice(1).map((c, i) => c / close[i]! - 1)
  const features: number[][] = [[], []]
  for (let t = 12; t < close.length; t++) {
    features[0]!.push(close[t]! / close[t - 12]! - 1)   // momentum
    features[1]!.push(-(close[t]! / close[t - 5]! - 1)) // reversal
  }

  // 3) 中性化：z-score（对照组）
  const neut = factorNeutralize(features[0]!, { method: 'zscore' })
  console.log(`neutralize: ${neut.method}, ${neut.values.length} values`)

  // 4) 线性模型：样本 = 特征[t]，标签 = 未来一期收益
  const n = features[0]!.length
  const X: number[][] = []
  const y: number[] = []
  for (let t = 0; t < n - 2; t++) {
    X.push([features[0]![t]!, features[1]![t]!])
    y.push(ret[13 + t]!) // features[t]（对应 close[12+t]）预测 ret[13+t]
  }
  const split = Math.floor(X.length * 0.7)
  const fit = fitLinearModel(X.slice(0, split), y.slice(0, split), 0.1)
  const pred = predictLinearModel(fit, X.slice(split))
  const evalOut = evaluatePredictions(pred, y.slice(split))
  console.log(`linear model: intercept ${fit.intercept.toFixed(5)}, weights [${fit.weights.map(w => w.toFixed(5)).join(', ')}]`)
  console.log(`  train R2 ${fit.trainR2.toFixed(4)} | test R2 ${evalOut.r2?.toFixed(4) ?? 'n/a'} | test IC ${evalOut.ic.toFixed(4)}`)

  // 5) walk-forward（滚动样本外验证）
  const returns = [0, ...ret.slice(12)]
  const wf = walkForward(returns, features.map(fx => [0, ...fx.slice(0, fx.length - 1)]), 60, 20)
  console.log(`walk-forward: ${wf.windows.length} windows, OOS n ${wf.oosCount}, OOS IC ${wf.oosIc.toFixed(4)}, OOS RankIC ${wf.oosRankIc.toFixed(4)}`)

  // 6) 结论（demo 的教育性收尾）
  console.log('\n=== conclusions ===')
  console.log(`- train R2 (${fit.trainR2.toFixed(3)}) vs test IC (${evalOut.ic.toFixed(3)}): ` +
    (Math.abs(fit.trainR2 - Math.abs(evalOut.ic)) > 0.3 ? 'gap 大 → 过拟合风险' : 'gap 可控'))
  console.log(`- walk-forward OOS IC (${wf.oosIc.toFixed(3)}) 才是诚实的样本外证据；正 IC 才有研究价值`)
  console.log('- 特征数量 2 << 样本数 ' + X.length + '：符合「每特征 30+ 样本」经验线')
  console.log('- 下一步（内部 PCPT）：特征扩充 → 树/DL/RL；dsh-quant 提供方法与验证框架，不提供生产策略')
}

await main()
