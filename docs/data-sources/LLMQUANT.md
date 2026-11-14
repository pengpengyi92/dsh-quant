# LLMQuant Data: listing, access and verification

Checked 2026-11-14 (Asia/Shanghai). This is a source/access review, not an
authenticated service benchmark or an endorsement of every data product.

## Already listed; the access description needed correction

LLMQuant/data-mcp was already in Issue2, `docs/QUANT_ECOSYSTEM.md`, the plugin
data page and the `data-mcp` channel. It is not a new discovery. The channel
incorrectly described it as free and a native DSH plugin, and missing
credentials did not block the local readiness heuristic.

The [upstream README](https://github.com/LLMQuant/data-mcp/tree/3ecdeafcd613b2d6634cdd8f3bba932a0cb468a4)
documents account-based beta credits, an API key for local stdio, and a
separately revocable hosted connector URL. It offers signup trial credits;
that is not unlimited anonymous access. A zero-credit tool still needs
authorization. The code license does not grant rights to redistribute the
service's data. The upstream repository says it is a read-only mirror and
accepts issues rather than PRs.

## Paid or free?

Registration/authentication is required for service use. Paying is not
necessarily required to try the documented beta allowance. The official
[pricing page](https://llmquantdata.com/pricing) returned403 in both the web
reader and ordinary browser lookup. The docs host was also unavailable to
the web reader. Current cash prices, allowance size, expiry, entitlements and
actual signup screens therefore remain **UNVERIFIED**. Do not reuse an old
price or confuse model-inference charges with data-service credits.

## Suggested user-controlled evaluation workflow

The following is our evaluation plan, not a claim that these steps were run:

1. Open the official site yourself; inspect current terms, pricing and data
   rights before creating an account or buying anything.
2. Choose local stdio or the hosted connector. Store secrets only in your
   client/environment's secret facility; never in a PR, Issue or shell transcript.
3. For local stdio, npm metadata and the pinned upstream manifest agree on
   package `@llmquant/data-mcp@0.7.1`, MIT, Node>=20. A version-pinned launch
   command for an MCP client is `npx -y @llmquant/data-mcp@0.7.1`; the key is
   supplied privately through `LLMQUANT_API_KEY`. This is not `dsh plugin add`.
4. Verify the MCP handshake/tool list with the client. Select a non-personal
   metadata/read operation only after checking its current credit cost.
5. Record only sanitized version, operation, time, status and confirmed cost.
   Distinguish configuration readiness, authentication, quota and data quality.
6. Before a credit-consuming trial, approve a bounded call/storage budget.
   Stop on authorization/quota errors; no account rotation or access bypass.
7. Test timestamp semantics, revisions, identifiers and coverage against a
   permitted reference. A successful response is not PIT certification.
8. Revoke trial credentials/connectors when no longer needed. Treat the full
   hosted URL as a password; it is not a shareable public endpoint.

No account, payment, MCP installation, authenticated API call or personal
holdings/profile access was performed in this review. Commercial permissions
and terms interpretation need provider confirmation; this is not legal advice.

## Implemented here

- The existing channel keeps its name/identity but is categorized as an
  API-platform MCP connector, with account/credit/rights prerequisites.
- `accessReadiness('data-mcp')` now blocks missing credentials. Passing
  `hasCredentials=true` only satisfies that local heuristic, not a live check.
- Regression tests cover the description, missing-key block, version/prerequisites
  and no automatic upgrade to official-source/data-reliability status.
- No data provider is added to `quant_market_fetch`, no upstream code is
  vendored, and no claim that the current npm0.92.0 already includes this patch.

Primary evidence: [pinned MCP source](https://github.com/LLMQuant/data-mcp/tree/3ecdeafcd613b2d6634cdd8f3bba932a0cb468a4),
[npm package](https://www.npmjs.com/package/@llmquant/data-mcp/v/0.7.1),
[pricing page](https://llmquantdata.com/pricing),
[official docs](https://docs.llmquantdata.com).
