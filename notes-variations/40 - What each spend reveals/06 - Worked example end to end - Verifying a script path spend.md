# 40.06 · Verifying a script path spend

Variation 6 of slide 40 (What each spend reveals) · lens: Worked example end to end · deck `fcv-g-json-taproot` page 32 · 5 steps · script 137 words, about 60 s

## Script

Verifying the script path spend of leaf B, BIP341 test vector case 5. Given: output key q, script B, control block.

**[1]** Parse the control block: leaf version 0xc0, parity 0, 97 bytes so m = 2. The internal key p is e0dfe230….

**[2]** Hash the script: k0 is the TapLeaf hash of c0, length 0x22 and the script: ba982a91….

**[3]** Fold in the path. e0, 9e31…, is smaller than k0, ba98…, so k1 is TapBranch of e0 then k0: ffe578e9…. e1, 2645…, is smaller than k1, so k2 is TapBranch of e1 then k1: ccbd66c6…, the Merkle root.

**[4]** The tweak t is the TapTweak hash of p and k2: b57bfa18…, below the group order n.

**[5]** x(P + t·G) equals q, 91b64d53…, and y is even, matching parity 0. The commitment holds, and script B runs against the witness signature.

## Background

- **k0, k1, k2**: the running hash from the leaf up to the root; k2 is the Merkle root.
- **Ordering decision**: TapBranch hashes the lexicographically smaller 32-byte input first. Here the first byte decides: 0x9e < 0xba and 0x26 < 0xff.
- **Tweak check**: t must be below n; otherwise the spend fails.
- **Final comparison**: both x(Q) and the parity of y(Q) must match. The parity comes from bit 0 of control byte 0.
- **Vector fields**: `leafHashes`, `merkleRoot`, `tweak` and `tweakedPubkey` of `scriptPubKey[5]` hold the intermediate values.

## Speaker note

- Checked against `wallet-test-vectors.json` case 5: k0 = leaf hash id 1, k2 = `merkleRoot`, t = `tweak`, q = `tweakedPubkey`. k1 (`ffe578e9…`) appears as the path hash in leaf A's control block.
