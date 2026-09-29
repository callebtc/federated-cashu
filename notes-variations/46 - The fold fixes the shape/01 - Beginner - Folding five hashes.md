# 46.01 · Folding five hashes

Variation 1 of slide 46 (The fold fixes the shape) · lens: Beginner · deck `fcv-h-nutroot-tree` page 28 · 5 steps · script 140 words, about 60 s

## Script

Five leaf hashes, folded one level at a time. Each letter stands for a 32-byte hash.

**[1]** The hashes are sorted ascending: a, then b, c, d and e.

**[2]** Level 1: neighbours pair. ab is the branch hash of a and b, cd the branch hash of c and d. e has no partner and moves up unchanged.

**[3]** Level 2: ab pairs with cd into abcd. e moves up again.

**[4]** Level 3: abcd pairs with e. One hash is left: the root.

**[5]** To prove c, a spender sends the sibling at each level: d, then ab, then e. That is a path of three hashes. To prove e, one hash is enough: abcd. So a, b, c and d have paths of three, and e has a path of one. Each pair is hashed smaller value first, under the branch tag.

## Background

- **Leaf hash**: a 32-byte tagged hash of one leaf's bytes; here abbreviated to a letter.
- **Branch hash**: tagged_hash("Cashu_NutrootBranch", smaller ‖ larger) of two hashes.
- **Promoted**: an unpaired last hash moves to the next level as it is, without being hashed again.
- **Merkle path**: the sibling hashes from a leaf up to the root. A verifier starts from the leaf hash and combines it with each sibling in turn; if it arrives at the root, the leaf is in the tree.
- **Path length**: the number of sibling hashes, equal to the leaf's depth in the tree.
