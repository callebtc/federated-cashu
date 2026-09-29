# 46.06 · Spend paths: BIP341 and nutroot side by side

Variation 6 of slide 46 (Key path and script path) · lens: Framing: comparison with BIP341 · deck `fcv-i-nutroot-spend` page 8 · 3 steps · script 140 words, about 60 s

## Script

BIP341 on the left, nutroot on the right.

**[1]** Key path. BIP341: one 64-byte signature, 65 with a sighash type byte, by q = p + t with parity negation, against the 32-byte output key. Nutroot: exactly one signature, by p′ = (k + t) mod n over the input digest, against x(P).

**[2]** Script path. BIP341's control block is one byte of leaf version and parity, the x-only internal key, and up to 128 path hashes. Nutroot sends JSON: the leaf with its own version byte, a 33-byte K, at most three hashes, signatures, an optional preimage.

**[3]** The check. BIP341 tweaks over x(P), fails if t is at least n, matches x(Q) and parity, then executes the script. Nutroot tweaks over the 33-byte K, reduces t mod n, requires K + t·G to equal the secret, then evaluates a declarative leaf.

## Background

- **BIP341 notation**: P is the internal key, Q = P + t·G the output key, q its 32-byte x-coordinate. Nutroot calls these K and P.
- **Parity bit**: a BIP341 output stores only x(Q), so the control block carries the parity of Q's y to identify the point. A nutroot secret is a full compressed point, so no parity bit is needed.
- **Sighash type byte**: an optional 65th byte selecting which parts of a Bitcoin transaction are signed. Nutroot has one rule: each input signs its input digest.
- **t ≥ n**: BIP341 fails on a tweak at or above the curve order; nutroot reduces it mod n. Either case has negligible probability.
- **Sorted branches**: both BIP341's TapBranch and nutroot's Branch hash the smaller child first, so neither needs left/right flags.
- **Script vs declarative leaf**: a tapscript is a program run by the script interpreter (BIP342). A nutroot leaf is a record with fixed fields (n, keys, time, hash) evaluated by fixed rules.
- **Path length**: BIP341 allows 0 to 128 path hashes (control block 33 + 32·m bytes). Nutroot caps a tree at 8 leaves, so a path has at most 3 hashes.
