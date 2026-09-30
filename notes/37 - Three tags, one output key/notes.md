# 37 · Three tags, one output key

2.2 Taproot · 5 steps · script 120 words, about 50 s

## Script

Three tagged hashes build one output key. The legend gives the colour of each tag.

**[1]** Each script is hashed with the TapLeaf tag, together with its leaf version and length.

**[2]** The leaf hashes of B and C are combined with the TapBranch tag, the smaller hash first.

**[3]** The leaf hash of A and the BC branch are combined with TapBranch again. The result is the root; it commits to all three scripts.

**[4]** The internal key P and the root are hashed with the TapTweak tag. The result is the tweak t.

**[5]** The tweak moves P to Q = P + t·G. The output script is OP_1 followed by the 32-byte x(Q). Nothing in the output shows that a tree exists.

## Background

- **Tagged hash (BIP340)**: SHA-256 over two copies of SHA-256 of the tag name, then the message. Different tags give unrelated hash functions.
- **Merkle tree**: leaves are hashed, then pairs of hashes are hashed level by level up to one root. Proving one leaf needs only the sibling hashes on its path.
- **Sorted branch**: TapBranch hashes its two children in byte order, so a proof does not need to say which child is left or right.
- **Tweak**: t·G added to the internal key. The owner of p can sign for Q with the secret p + t.
