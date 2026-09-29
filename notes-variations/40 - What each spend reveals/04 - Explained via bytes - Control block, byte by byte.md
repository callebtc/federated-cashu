# 40.04 · Control block, byte by byte

Variation 4 of slide 40 (What each spend reveals) · lens: Explained via bytes · deck `fcv-g-json-taproot` page 30 · 5 steps · script 138 words, about 60 s

## Script

Leaf B's control block from the BIP341 wallet test vectors, case 5: 97 bytes.

**[1]** Byte 0, bytes 1 to 32, then two 32-byte hashes.

**[2]** Byte 0 is c0. Its upper seven bits are the leaf version, c[0] AND 0xfe: 0xc0, tapscript. The lowest bit is the parity of y(Q): 0, even. Case 6's control blocks start with c1: odd y(Q).

**[3]** Bytes 1 to 32 are p, the x-only internal key, lifted to the point P with even y.

**[4]** Then one hash per level, starting next to the leaf. e0 is the leaf hash of C, B's sibling. e1 is the leaf hash of A, the sibling of branch BC.

**[5]** The length is 33 + 32m, m from 0 to 128: 33 to 4129 bytes; here m = 2. No direction bits are stored, because branches sort their inputs.

## Background

- **Bitmask**: `c[0] & 0xfe` clears the lowest bit and leaves the leaf version; `c[0] & 1` keeps only the lowest bit, the parity.
- **lift_x**: returns the curve point with the given x and even y, or fails.
- **Path order**: e0 is combined with the leaf hash first, e1 with the result; the last result is the Merkle root.
- **Test vector names**: the slide's leaves A, B, C are leaf ids 0, 1, 2 of `scriptPubKey[5]` in `bip-0341/wallet-test-vectors.json`.
- **Maximum 4129 bytes**: 33 + 32·128. BIP341 caps the depth at 128: in a probability-optimal tree, a deeper leaf would have a spend probability below 2^-128, the security bound.

## Speaker note

- Checked against `wallet-test-vectors.json`: `scriptPathControlBlocks[1]` of case 5 is `c0 ‖ e0dfe230… ‖ 9e31407b… ‖ 2645a02e…`, and `9e31407b…` / `2645a02e…` are the leaf hashes of ids 2 and 0. Case 6 control blocks start with `c1`.
