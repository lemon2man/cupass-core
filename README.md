---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '138def2b-5a72-4e72-b4fc-c0d5e04f9fb1'
  PropagateID: '138def2b-5a72-4e72-b4fc-c0d5e04f9fb1'
  ReservedCode1: '3c30380a-5a9f-40a8-bfe4-fdd6b3f21b82'
  ReservedCode2: '3c30380a-5a9f-40a8-bfe4-fdd6b3f21b82'
---

# cupass-core

> Browser-side data modules and algorithm building blocks from [cupass.com](https://www.cupass.com) — smart card, EMV, cryptography and checksum utilities.

## Why

CUPASS is a security-industry toolbox. Every tool on the site runs **entirely in the browser** — no data ever leaves your machine. This repository publishes the core building blocks we use in production so developers, testers and automation agents can reuse them directly.

All modules are plain ES modules with **zero dependencies**. If it works here, it works in a browser, in Node, and inside an MCP server.

## Modules

### Data (`src/data`)

| File | Contents | Size |
|---|---|---|
| `emv-tags.js` | EMV tag dictionary — tag, name, description (Chinese) | 36 tags |
| `aid-list.js` | Application Identifier (AID) database: Visa / MasterCard / UnionPay / T-Union / national eID, USIM, GP ISD, PKI | 19 entries |

### Algorithms (`src/algorithms`)

| File | Purpose |
|---|---|
| `aes.js` | AES encryption/decryption |
| `sm4.js` | Chinese national standard SM4 block cipher (GB/T 32907-2016) |
| `asn1.js` | ASN.1 DER parsing / TLV walk |
| `crc.js` | CRC family checksums |
| `hash.js` | Hash utilities |
| `luhn.js` | Luhn checksum (PAN validation) |
| `base64.js` | Base64 encode/decode |

## Usage

```js
// Node (>= 14) or any bundler — ES module
import { emvTags } from "./src/data/emv-tags.js";
import { aidDatabase } from "./src/data/aid-list.js";

const aid = aidDatabase.find(a => a.aid === "A0000000041010");
// → { aid: "A0000000041010", name: "MasterCard 贷记", provider: "MasterCard" }
```

In a browser page just serve `/src` as static files and import as usual — that is exactly how cupass.com loads them.

## Design rules

1. **Zero dependencies** — one file, one concern, plain ES module exports.
2. **All computation stays local** — these modules never make network calls. The "browser-local" property is part of the API contract, not an implementation detail.
3. **Data and code live in the same repository** so the dictionary pages (e.g. the EMV tag reference on cupass.com) are programmatically generated from the exact same source files, eliminating drift.

## Source of truth

The files in `src/` are the **production copies** served by www.cupass.com. Upstream changes flow: `static/js/algorithms` + `static/js/data` (site) → mirrored to this repo. Until CI is added, the mirror is refreshed on every site deploy that touches those files.

## License

MIT — see [LICENSE](LICENSE). Data dictionaries are factual reference data (tag names, AID values) compiled from public EMV/ISO/GlobalPlatform/UnionPay documentation.

> AI生成