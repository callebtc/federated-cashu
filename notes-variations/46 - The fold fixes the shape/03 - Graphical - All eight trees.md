# 46.03 · All eight trees

Variation 3 of slide 46 (The fold fixes the shape) · lens: Graphical · deck `fcv-h-nutroot-tree` page 30 · 8 steps · script 124 words, about 55 s

## Script

All eight permitted tree shapes, one per step. Dashed nodes are promoted unchanged; the digits are the path lengths per leaf, in sorted order.

**[1]** One leaf: path length 0.

**[2]** Two leaves: 1 and 1.

**[3]** Three: 2, 2, 1. The third hash is promoted once.

**[4]** Four: all 2, a full tree.

**[5]** Five: 3, 3, 3, 3, 1. The fifth hash is promoted twice and joins at the root.

**[6]** Six: 3, 3, 3, 3, 2, 2. The branch of the last pair is promoted at level 2.

**[7]** Seven: six leaves at 3, one at 2. The seventh hash is promoted at level 1.

**[8]** Eight: all 3, a full tree. No path is longer than three sibling hashes, and the shape depends only on the leaf count.

## Background

- **Path length**: number of sibling hashes a script-path spend of that leaf reveals, equal to the leaf's depth.
- **Sorted order**: leaves are placed by ascending leaf hash, so the digits read left to right in that order.
- **Promoted node**: an unpaired last hash carried to the next level without hashing, drawn dashed.
- **Full tree**: with 2, 4 or 8 leaves every level pairs completely, so all paths have the same length.
- **Path lengths per leaf count**: 1: 0; 2: 1 1; 3: 2 2 1; 4: 2 2 2 2; 5: 3 3 3 3 1; 6: 3 3 3 3 2 2; 7: 3 3 3 3 3 3 2; 8: all 3.
