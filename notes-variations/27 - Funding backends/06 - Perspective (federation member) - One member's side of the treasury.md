# 27.06 · One member's side of the treasury

Variation 6 of slide 27 (Funding backends) · lens: Perspective: federation member · deck `fcv-e-membership-custody` page 24 · 3 steps · script 134 words, about 55 s

## Script

One member's view of the treasury.

The left side is the member-local mintd config: the federated BDK backend and a chain source. It is not consensus config and holds no mnemonic or private key.

**[1]** Shared policy lives in the public config: network, confirmation depth, which defaults to 6 and must be at least 1, fee-policy version, and the Taproot descriptors for receive and change. They must match the active FROST application exactly.

**[2]** Local to this member: the chain source, Bitcoin Core RPC or Esplora, its credentials, timeouts, storage path, and the sealed FROST root share. A timeout or stale tip degrades only this member, which fails closed until a sync succeeds.

**[3]** Not available: a mnemonic, a standalone bdk section, any share, nonce or key export, force-spend or force-release. Rebroadcast only re-sends accepted signed bytes.

## Background

- **Chain source**: where a member reads the blockchain from. Bitcoin Core RPC talks to a local full node; Esplora is an HTTP block-explorer API.
- **chain_source_scope = "independent"**: a label saying this member uses its own chain infrastructure, not one shared with other members.
- **Taproot descriptors**: `tr(xpub/0/*)` for receive addresses and `tr(xpub/1/*)` for change. They let watch-only BDK derive every address from one extended public key.
- **Stale tip**: the chain source reports an old best block. The member then stops taking part in consensus-dependent actions until it syncs again.
- **Fee-policy version**: the version of the consensus rules for computing and capping fees.
- **Force-spend / force-release**: operator commands that would spend or unreserve coins outside consensus. They do not exist.
- **Rebroadcast**: an operator command that re-sends the exact persisted signed bytes of an accepted transaction. It cannot build a new spend or change an output.
