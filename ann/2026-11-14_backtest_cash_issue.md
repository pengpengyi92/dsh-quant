## Observed during a synthetic visualization check

At source baseline43315ef (2026-11-14), a profitable closed MA-cross trade
does not carry its realized proceeds into cash. No real trading/data was used.
The existing suite passes but does not catch this accounting identity.

```sh
node --import tsx --input-type=module -e 'import {backtestMaCross} from "./src/dsh-ml/backtest.ts"; const r=backtestMaCross([5,4,3,4,5,6,10,10,10,9,8,7],2,3,0.001); console.log(r.trades,r.equityCurve.at(-1));'
```

Actual trade: buy index5 at6, sell index10 at8. Reported final equity0.998001.
With normalized initial capital1, no remaining position and0.1% fee each side:

`expected = (8/6) * (1-0.001)^2 = 1.330668`.

An independent assertion comparing actual to expected fails, as it should.
The issue is not plotting: the signal-exit branch applies `cash *= 1-feeRate`
without realizing the price ratio, then records equity as cash. Review the
stop/target exit branches for the same pattern; their numerical effect is not
claimed separately reproduced here. The trade-return comment also promises
fees while the closed-trade `returnPct` currently uses a gross price ratio.

## Acceptance for a separately scoped fix

- Preserve signal-on-i/fill-on-i+1, aligned arrays and no-look-ahead conventions.
- Independently reconcile winning, losing and flat round trips,0/nonzero fees,
  multiple closed trades, and open positions; cash + market value must reconcile.
- Cover signal exits and stop/target paths. Explicitly settle gross/net trade
  return semantics and update tests/docs consistently rather than encoding the bug.
- Re-run full tests, real tool runtime and all compatibility/consumer CI gates.
- No claimed strategy alpha, production readiness, private data or order execution.

The visualization contribution does not silently fix the engine. Its public
figure instead uses clearly labelled manually scripted synthetic fills and a
hand-checkable fixture ledger, not a strategy result or replacement engine.
Thanks for reviewing the accounting as well as the chart; reproducible tests
and continued collaboration are welcome, with the usual review standards.
