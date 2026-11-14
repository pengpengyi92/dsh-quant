# Selected public abstraction: source receipt and PIT fixture

Origin: a read-only review of **PDAT (proprietary/private repository)**.
The owner requested selective public material, not a mirror of that repository.
This independently written reference releases generic data-governance ideas
and a new synthetic fixture under this repository's license. It exports no
private runtime code, internal registry, credentials, vendor response, customer
data, strategy, position, log, procurement record or commercial plan.

## What is selected for public use

1. **Source receipt**: dataset/source identity, canonical public source URL,
   code/data-rights references, acquisition time, schema/unit/adjustment policy,
   raw checksum and validation state should travel with a dataset.
2. **Separate clocks**: event date, source publication and our observation time
   answer different questions. Latest downloaded data is not automatically the
   data known at a historical decision time.
3. **Fail-closed sharing**: access, code license, permitted research use and
   redistribution are separate. Unknown rights do not authorize publication.
4. **Explicit evidence states**: a listed connector is not an installed one;
   a locally tested sample is not a production feed or certified trading input.

These are public design abstractions, not a declaration that proprietary PDAT
code has been relicensed or that its implementation is included here.

## Reusable source-receipt checklist

| Field | Question to answer |
|---|---|
| source_id / dataset_version | Which source and immutable dataset revision? |
| source_url / rights_reference | Where is primary evidence, and what use is allowed? |
| code_license / data_rights | Do not substitute the SDK license for data rights. |
| event_at / published_at / observed_at | When did it happen, become available and become known to this consumer? |
| schema / units / adjustment | What do values mean; raw or adjusted, currency and calendar? |
| raw_checksum / transform_version | Can the input and transformation be identified again? |
| validation / freshness / missing_policy | What failed; are missing data and stale observations explicit? |
| disclosure / redistribution | What can leave the private environment, under what evidence? |

## Synthetic vintage example

[`synthetic-vintages.json`](synthetic-vintages.json) contains invented DEMO
observations and rights cases, not market data. Its expected decisions illustrate:

- a later revision must not appear before publication;
- publication before a cutoff still does not imply this consumer observed it;
- unknown or research-only rights do not allow external redistribution;
- explicit synthetic-owned permission applies only to this invented fixture.

Run `node --import tsx --test tests/data-sources.spec.ts` from the repository
root. These are bounded fixture/contract checks, not a new public ingestion
engine, authorization service, legal opinion or a vendor integration.

## Private candidates not exported

Live collectors, event/replay implementations, entitlement/billing controls,
private SQL teaching context, source-specific mappings and real datasets stay
in the proprietary repository. Future code selection requires an independent
scope, ownership/license review, secret/IP scan, synthetic tests and Human
approval before publishing. There is no public PDAT source mirror in this change.
