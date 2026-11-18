# JQ Factor Lab — external factor-evaluation teaching reference

Observed 2026-11-18 (Asia/Shanghai). **Link only · maintainer NOT_RUN · not a dsh plugin.**

- **Intake:** [#109, factor evaluation / IC](https://github.com/pengpengyi92/dsh-quant/issues/109#issuecomment-6895809764)
  by **@ft1148137**, who disclosed a project affiliation and AI-assisted write-up.
  This was a repository recommendation, not a factor submission or code PR.
- **Source:** [GSX-Eis/jq-factor-lab at 7e24b71](https://github.com/GSX-Eis/jq-factor-lab/tree/7e24b714e0b82c7f786b16fd27ad836b08ac9212),
  with [Apache-2.0 LICENSE](https://github.com/GSX-Eis/jq-factor-lab/blob/7e24b714e0b82c7f786b16fd27ad836b08ac9212/LICENSE)
  and [NOTICE](https://github.com/GSX-Eis/jq-factor-lab/blob/7e24b714e0b82c7f786b16fd27ad836b08ac9212/NOTICE).
  Code licensing does not establish rights to external market data or override third-party licenses.
- **Teaching value:** [the synthetic generator](https://github.com/GSX-Eis/jq-factor-lab/blob/7e24b714e0b82c7f786b16fd27ad836b08ac9212/examples/generate_data.py)
  builds fictional daily prices (180 weekdays × 20 symbols); the
  [demo](https://github.com/GSX-Eis/jq-factor-lab/blob/7e24b714e0b82c7f786b16fd27ad836b08ac9212/tools/demo_cli.py)
  reads CSV, uses in-memory DuckDB, and emits local IC and quantile artifacts.
  The [demo configuration](https://github.com/GSX-Eis/jq-factor-lab/blob/7e24b714e0b82c7f786b16fd27ad836b08ac9212/config/demo.json)
  uses execution lag 1 and a synthetic weekday calendar; neither establishes point-in-time
  correctness on real data. The submitter reports a successful single synthetic example on
  Linux/Python 3.12; that is not an independent maintainer run or an investment result.

## Review boundary

Maintainers checked the canonical repository, pinned tree, license/notice,
and relevant example/configuration paths without installing or running upstream code.
The full tree contained 392 regular blobs, with no executable-mode file, symlink,
submodule, Actions workflow, or obvious bundled binary/data artifact by path.
This inventory is not a proof of safety, integrity of dependencies, or full source/history coverage.

The wider repository includes research backends. The demo
[loads and executes Python factor files](https://github.com/GSX-Eis/jq-factor-lab/blob/7e24b714e0b82c7f786b16fd27ad836b08ac9212/backtest_and_analysis/factor_loader.py#L26-L49)
specified by its configuration; it is not a sandbox. The shared factor base can
[read host data bindings](https://github.com/GSX-Eis/jq-factor-lab/blob/7e24b714e0b82c7f786b16fd27ad836b08ac9212/utils/factor_base.py#L209),
so the synthetic example is not a guarantee of isolation in an arbitrary environment.
Other paths include pickle-backed caching
and JoinQuant integration; [dependencies](https://github.com/GSX-Eis/jq-factor-lab/blob/7e24b714e0b82c7f786b16fd27ad836b08ac9212/pyproject.toml)
are not fully locked. Do not auto-install or auto-run this entry, load untrusted factors,
configs or caches, or supply credentials or real data. Nothing is vendored or configured by
dsh-quant. dsh adaptation, null alignment, time alignment, independent numerical accuracy,
performance, end-to-end safety and live use were **not validated**. No rating or endorsement.
