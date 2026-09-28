# 42.04 · Output key construction in code

Variation 4 of slide 42 (Taproot output keys (BIP341)) · lens: Explained via code · deck `fcv-g-json-taproot` page 22 · 5 steps · script 138 words, about 60 s

## Script

The construction in short Python, following BIP341.

**[1]** tagged: SHA-256 of the tag string, written twice, then the message. The two copies form a 64-byte prefix.

**[2]** leaf_hash: the TapLeaf hash of the leaf version, 0xc0 by default, the script length as compact size, and the script.

**[3]** node_hash recurses. A leaf returns its leaf hash. A branch hashes its two children with TapBranch, smaller first, so a proof needs no left or right bits.

**[4]** output_key: with no tree, the root is empty. t is the TapTweak hash of the 32-byte p and the root, as a big-endian integer. If t is at least the group order N, it fails.

**[5]** Q is the even-y lift of p plus t·G. It returns x(Q) and the parity of y(Q). The output script is 51 20 x(Q); script path spends need the parity bit.

## Background

- **min and max on bytes**: Python compares byte strings lexicographically, which is the order BIP341 uses for branches.
- **compact_size**: Bitcoin's variable-length integer: one byte for values below 253, otherwise a marker byte and 2, 4 or 8 bytes little-endian.
- **Empty root**: with no scripts the tweak hashes only p, as BIP341 recommends for key-path-only outputs.
- **N**: the order of the secp256k1 group. A tweak at or above N is rejected rather than reduced.
- **lift_x(p)**: the point with x-coordinate p and even y.
- **51 20**: OP_1 (segwit version 1), then a 32-byte push.
- **Parity bit**: stored in the low bit of the control block's first byte in a script path spend.

## Speaker note

- The code is a condensed sketch, not a copy of the BIP341 reference; BIP341 names the functions `taproot_tree_helper`, `taproot_tweak_pubkey` and `taproot_output_script`. The logic matches.
