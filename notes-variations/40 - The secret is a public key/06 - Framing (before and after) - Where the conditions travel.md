# 40.06 · Where the conditions travel

Variation 6 of slide 40 (The secret is a public key) · lens: Framing: before and after · deck `fcv-h-nutroot-tree` page 8 · 4 steps · script 139 words, about 60 s

## Script

Top row: v1 and v2 keysets. Bottom row: v3.

**[1]** Before v3, the sender's token carries the conditions inside the secret: JSON with kind, data and tags, 195 bytes for a P2PK lock.

**[2]** The receiver swaps with the same JSON secret plus signatures. The mint reads the whole policy, on every spend.

**[3]** With v3, the proof's secret is a 33-byte point. The conditions travel beside it in spend info: k or E, K, the tree and u, as needed. The tree is every leaf in full.

**[4]** The swap input carries the same 33 bytes and a witness: one signature on the key path, or one leaf with K, path and signatures on a script path. Spend info stays with the wallets. On the key path the mint learns nothing about the conditions; on a script path it sees one leaf.

## Background

- **Spend info**: data sent with a token to the next holder, never to the mint. Fields: `k` a bearer private key, `E` an ephemeral public key for NUT-28, `K` the internal key, `tree` the full leaves, `u` the NUMS offset. `k` and `E` exclude each other; `u` is present exactly for NUMS internal keys.
- **NUT-10 JSON secret**: `[kind, {nonce, data, tags}]`, for example kind P2PK with a public key in data and further keys, locktime and refund keys in tags.
- **Swap (NUT-03)**: the wallet sends proofs as inputs and receives new blind signatures on outputs of the same value.
- **Why the tree is needed even for the key path**: the tweak depends on the root, so the owner of a locked proof needs the tree to compute its signing key.
- **Opaque sibling hashes**: in a script-path spend, the other leaves appear only as 32-byte hashes in the path.
