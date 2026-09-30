# removed.05 · What the mint sees when each use is spent

Variation 5 of slide removed (What the specification covers) · lens: Perspective: mint · deck `fcv-j-nutroot-use` page 15 · 3 steps · script 116 words, about 50 s

## Script

What arrives at the mint when each use is spent, and what checkstate returns.

**[1]** Key-path rows: bearer token, pay to a key, aggregated multisig. The mint receives a 33-byte secret and one 64-byte signature. The three are byte-identical on the wire.

**[2]** Script-path rows show the leaf. Leaf multisig: a 75-byte leaf, K, the path and two signatures. Refund: a 49-byte after leaf and one signature. HTLC: a 77-byte leaf and a preimage of at most 32 bytes. Auditable lock: a 46-byte leaf.

**[3]** Checkstate, NUT-07: a spent v3 proof returns a commitment. Witness and input digest are published only for leaves with disclosure: always for the auditable lock, for an HTLC only if its leaf sets it.

## Background

- **Key path**: one signature by the secret's own private key; no tree is revealed, so a locked proof and a bare key look the same.
- **Script path**: the witness reveals one leaf, the internal key K, the merkle path and the leaf's signatures.
- **Leaf sizes**: from tests/10-tests.md. 2-of-2 threshold 75 B, after 49 B, hashlock 77 B, threshold with disclosure 46 B.
- **Commitment**: tagged_hash("Cashu_SpendCommitment", Y ‖ input_digest ‖ witness_hash). The mint returns it for every spent v3 proof; only the spender can open it, unless the leaf has disclosure.
- **Disclosure**: leaf field 0x0a, mode 0x01. The mint must then publish the exact witness and input digest.
- **Other signers (slide note)**: a quote lock signs by key path or script path (NUT-04); a blind auth token by key path only (NUT-22).
