# 47.02 · Verifier steps, rules and rejection vectors

Variation 2 of slide 47 (Script path verification) · lens: Advanced · deck `fcv-i-nutroot-spend` page 12 · 4 steps · script 140 words, about 60 s

## Script

**[1]** Step 1: at most 3 sibling hashes, which the 8-leaf cap and the normative fold guarantee for every valid tree. A fourth hash rejects before any hashing.

**[2]** Step 2: leaf hash, Branch over sorted pairs, then t over K and root, mod n, never rejected. K + t·G must equal the 33-byte secret. The two-leaf vector's type 0x05 leaf passes this step.

**[3]** Step 3: version 0x00, an allocated type, known fields strictly ascending, disclosure only 0x01, minimal integers. The 0x05 leaf fails here, as do field 0x09 and disclosure 0a000100, 0a0000 and 0a000102.

**[4]** Step 4: commit rejects; after needs the clock at or past its time; hashlock needs the preimage. Then at least n distinct listed keys with valid signatures, and no more signatures than listed keys. Alice's signature listed twice fails. Keys are counted because Schnorr signatures are non-deterministic.

## Background

- **Fail closed**: anything not understood makes the path unsatisfiable instead of being skipped. An unknown leaf type disables only that path of that proof.
- **Why 0x05 passes step 2**: the commitment check only hashes bytes; it does not interpret them. The two-leaf vector's type 0x05 leaf is really in the tree, so only parsing stops it.
- **Minimal integers**: no leading zero byte; zero encodes as zero bytes.
- **Disclosure modes**: only 0x01 (`0a000101`) is valid. Mode 0x00, an empty value and the unallocated mode 0x02 are malformed, so private leaves keep one encoding.
- **Non-deterministic Schnorr**: the signer chooses a nonce, so one key can produce many valid signatures for one message. Counting signatures would let one key count several times.
- **8 leaves, 3 hashes**: under the normative fold, 8 = 2³ leaves need at most 3 sibling hashes per path.
- **Leaf validation** (bottom box): 1 ≤ n ≤ number of keys, no two keys sharing an x-coordinate, leaf body at most 512 bytes; enforced when building and when verifying a disclosed tree.
