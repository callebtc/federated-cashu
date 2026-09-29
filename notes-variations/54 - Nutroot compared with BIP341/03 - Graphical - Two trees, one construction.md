# 54.03 · Two trees, one construction

Variation 3 of slide 54 (Nutroot compared with BIP341) · lens: Graphical · deck `fcv-j-nutroot-use` page 22 · 4 steps · script 129 words, about 55 s

## Script

BIP341 on the left, nutroot on the right.

**[1]** Three leaves each: tapscripts on the left, TLV records on the right.

**[2]** BIP341: the builder chooses the depths, here one script at depth 1 and two at depth 2. Nutroot: the fold sorts the hashes, pairs two, and promotes the unpaired last hash unchanged, drawn dashed. The shape depends only on the leaf count.

**[3]** The tweak. BIP341 adds t·G to P and gets Q. Nutroot adds t·G to K and gets the secret.

**[4]** BIP341 publishes x(Q), 32 bytes, and fails when t ≥ n; its control block holds the leaf version with the parity, x(P), and up to 128 path hashes. Nutroot keeps all 33 bytes, takes t mod n, and its control is K plus at most 3 path hashes.

## Background

- **Chosen depth**: in BIP341 the constructor places likely scripts near the root so their merkle proofs are shorter.
- **Sorted fold**: sort leaf hashes ascending, hash neighbours in pairs per level, promote an unpaired last hash unchanged. Every implementation builds the same tree from the same leaf set.
- **Promotion**: the unpaired hash moves up a level without being hashed again.
- **Control block (BIP341)**: first byte = leaf version with the parity of Q in the lowest bit, then x(P), then 32 bytes per path level: 33 + 32m bytes, m ≤ 128.
- **Nutroot control**: a JSON object with K, 33 bytes, and a path of at most 3 hashes, since a tree has at most 8 leaves.
- **t ≥ n**: BIP341 treats such a tweak as invalid; nutroot reduces it mod n.

## Speaker note

- Which leaf is promoted depends on the sorted hash order (the largest hash when the count is odd), not on the transmitted position; the figure draws it on the right.
