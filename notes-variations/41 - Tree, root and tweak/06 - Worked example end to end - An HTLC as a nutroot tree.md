# 41.06 · An HTLC as a nutroot tree

Variation 6 of slide 41 (Tree, root and tweak) · lens: Worked example end to end · deck `fcv-h-nutroot-tree` page 16 · 6 steps · script 139 words, about 60 s

## Script

**[1]** The policy: key 3 with the preimage of a1…a1, or key 4 from 2025-08-19, and no key path.

**[2]** One leaf per spend path, from the vectors: hashlock, 77 bytes, key 3 and hash a1a1…; after, 49 bytes, key 4 and time 1755561600.

**[3]** Their leaf hashes are 8f38ddf9… and 9ed9c0b8…. The internal key is a NUMS offset, K = H + u·G with u = 7: 028edfeb…. H is a point whose private key nobody knows. Real proofs use a fresh u.

**[4]** Two leaves: the root is their branch hash, lower hash first, 1f205396….

**[5]** Tweak 999d7474…, secret 03c11b5b….

**[6]** Key 3 reveals the hashlock leaf, path 9ed9c0b8…, with the preimage. Key 4 reveals the after leaf, path 8f38ddf9…, once the mint's clock reaches the time. No key path: K − 7·G = H. Spend info carries K, u and the tree.

## Background

- **HTLC**: hashed timelock contract. One party can spend with a secret preimage, the other can reclaim after a time.
- **Hashlock leaf**: satisfied by a preimage whose SHA-256 equals the leaf's hash (at most 32 bytes), plus signatures by n listed keys. A preimage alone never spends.
- **NUMS point H**: "nothing up my sleeve", `0250929b…ce803ac0`, the x-coordinate SHA-256 of the uncompressed generator G. Nobody knows its discrete logarithm.
- **NUMS offset**: K = H + u·G. Anyone given u checks K − u·G = H, which proves no key path exists. A fresh u per proof makes each K unique.
- **Two-leaf root**: tagged_hash("Cashu_NutrootBranch", min ‖ max); here `8f38…` is smaller than `9ed9…`, so the hashlock hash goes first.
- **Path of length 1**: each leaf's only sibling is the other leaf's hash.

## Speaker note

- Root `1f205396…`, tweak `999d7474…` and secret `03c11b5b…` are computed, not spec vectors (the slide says so). Recomputed with the NUT-10 tags and secp256k1: they match.
- The slide's footnote says "leaf hashes are vector values". `9ed9c0b8…` is in the vectors; the hashlock leaf hash `8f38ddf9…` is not printed in `tests/10-tests.md`. It is derived from the vector leaf; recomputed, it matches.
- NUT-14 (v3 note): a v3 hashlock used as an externally observable HTLC MUST carry `disclosure` mode 0x01. This leaf has none, so its preimage is known only to the mint and the spender. Do not present this tree as an HTLC a third party can observe.
