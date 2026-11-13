Two review findings addressed in a701f937b94d11219e34e2631eb00501cb075b0f:

1. A metadata refresh no longer claims to have repeated historical manual discovery searches. The dated manual record and six-known-repository refresh scope are separate.
2. A live repository SPDX label no longer proves the license of a pinned commit. Identification requires matching pinned root license path/blob evidence; missing, unknown or mismatched evidence stays review-gated.

Rechecked collector logic and deterministic negative controls. Local `npm test`: 333/333 passed, including nine ADIA tests. Historical snapshot values/timestamps are preserved. No external model execution, integration, financial performance or production readiness is claimed. The refreshed collector has not been exercised live; its injected API fixtures are not live-search evidence.

No remaining blocking finding in the scoped correction; current-head CI is the merge gate. This is a maintainer comment, not a self-approval represented as independent GitHub review.
