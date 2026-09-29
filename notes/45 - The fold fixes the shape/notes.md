# 45 · The fold fixes the shape

2.3 Nutroot secrets · 7 steps (1 to 8 leaves) · script 144 words, about 60 s

## Script

The fold is normative. Each step adds one leaf, from one up to eight. The numbers under the leaves are path lengths: how many sibling hashes a spend of that leaf reveals.

Sort the leaf hashes, pair neighbours on each level, and promote an unpaired last hash unchanged. The shape therefore depends only on the number of leaves. With three leaves the path lengths are 2, 2 and 1. With five, four leaves at depth 3 and one at depth 1. With eight, all at depth 3.

A payer can rebuild the tree a payee requested without being told its shape. There are no left or right flags, because each pair is hashed in sorted order. At most 8 leaves, so every path has at most 3 sibling hashes. Duplicate leaves are kept. BIP341 lets the constructor choose each leaf's depth; nutroot does not.

## Background

- **Normative**: required by the specification; every implementation must build exactly this shape.
- **Path length**: the number of sibling hashes in the witness for that leaf; it is also the leaf's depth in the tree.
- **Left/right flags**: without sorting, a verifier would need to know on which side each sibling hash goes. Sorted pairing makes the order implicit.
- **Path lengths per leaf count**: 1 leaf: 0; 2: 1 1; 3: 2 2 1; 4: 2 2 2 2; 5: 3 3 3 3 1; 6: 3 3 3 3 2 2; 7: 3 3 3 3 3 3 2; 8: all 3.
