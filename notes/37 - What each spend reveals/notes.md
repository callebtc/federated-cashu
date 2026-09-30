# 37 · What each spend reveals

2.2 Taproot · 4 steps · script 132 words, about 55 s

## Script

The same output drawn twice: Q commits to the internal key P and to a tree of three scripts.

**[1]** A sits at depth 1. B and C share a branch at depth 2.

**[2]** Key path: the spend shows only Q, verified with one signature. P, the tree and all three scripts stay hidden.

**[3]** Script path for B: the witness reveals P, script B, and two 32-byte hashes, the leaf hash of C and the leaf hash of A. The verifier recomputes the BC branch and the root from them, then the tweak and Q. A and C remain hashes.

**[4]** Witness sizes: the key path needs one 64-byte signature. The script path needs B's inputs, here a 64-byte signature, then the script, then a 97-byte control block: 33 bytes plus two 32-byte hashes.

## Background

- **Merkle proof**: the sibling hashes on a leaf's path. With them the verifier recomputes the root without seeing the other leaves.
- **Recomputed nodes**: the BC branch and the root are never sent; they follow from B's leaf hash and the two sibling hashes.
- **Control block size**: 33 + 32m bytes for a leaf at depth m; here m = 2, so 97.
