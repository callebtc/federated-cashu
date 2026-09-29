# 42.05 · What the mint receives

Variation 5 of slide 42 (The secret is a public key) · lens: Perspective: mint · deck `fcv-h-nutroot-tree` page 7 · 4 steps · script 138 words, about 60 s

## Script

Three spends as the mint receives them, with the receiver-keyed vectors.

**[1]** A: a bare key, spent by key path. The secret is 03a3e12c…, the witness one 64-byte signature. The mint learns that a key signed the input digest.

**[2]** B: a tweaked key, spent by key path. Secret 02d310a4…, again one 64-byte signature. The mint learns the same.

**[3]** C: the same tweaked key, spent by script path. The witness carries the after leaf, the internal key K, an empty path and the signature. The mint learns the leaf, key 4 from time 1755561600, the internal key, and that the tree has one leaf, because the path is empty.

**[4]** A and B have the same fields and lengths: the mint cannot tell whether a tree exists. Only C discloses a leaf, K and the path; other leaves would stay hashes.

## Background

- **Key path**: a spend with one signature by the secret's own private key (k for a bare key, (k + t) mod n for a tweaked one).
- **Script path**: a spend that reveals one leaf, the control data (K and the merkle path), and what the leaf requires, here a signature by key 4 after the time.
- **Empty path**: the leaf hash is itself the root. Under the fold, every leaf of a tree with two or more leaves has at least one sibling, so an empty path means a one-leaf tree.
- **1755561600**: Unix time for 2025-08-19 00:00 UTC.
- **Input digest**: the per-input message of the transaction transcript, a tagged hash of the transaction digest and the input's ID.
- **Receiver-keyed vectors**: Carol's static key 3 blinded at NUT-28 slot 0 with Alice's ephemeral key 5 gives K = `03a3e12c…`; the tree is one after leaf naming Alice's refund key 4.

## Speaker note

- Transcript signing over the input digest is specified in nuts#443 and not yet implemented in either federation branch.
