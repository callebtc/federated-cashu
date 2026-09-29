# 46.04 · Leaf count, levels, path lengths

Variation 4 of slide 46 (The fold fixes the shape) · lens: Explained via a table · deck `fcv-h-nutroot-tree` page 31 · 4 steps · script 137 words, about 60 s

## Script

For each leaf count: levels, branch hashes, promotions and path lengths, all computed from sort, pair, promote.

**[1]** One to four leaves. One leaf: no levels, no branches, path 0. Three leaves: two levels, two branches, one promotion, paths 2, 2, 1. Four leaves: two levels, three branches, all paths 2.

**[2]** Five to eight leaves all need three levels. There is always one branch fewer than leaves. Five leaves have two promotions and paths 3, 3, 3, 3, 1. Eight have none, and every path is 3.

**[3]** Nine leaves would need four levels, eight branches and three promotions. Such a tree is rejected.

**[4]** The reverse view: a script-path witness shows its path length. Length 0 means one leaf. Length 1 means two, three or five leaves. Length 2: three, four, six or seven. Length 3: five to eight.

## Background

- **Levels**: the number of fold rounds until one hash remains; the root's level.
- **Branches = n − 1**: every branch hash replaces two hashes with one, so reducing n hashes to one takes n − 1 branches.
- **Promotions**: unpaired last hashes carried up; 0 for 1, 2, 4 and 8 leaves.
- **Reverse table**: every witness reveals its path length to the mint, so the mint learns a set of possible tree sizes, not the exact size.
- **Row for 6**: three levels, five branches, one promotion (the last branch at level 2), paths 3 3 3 3 2 2. **Row for 7**: three levels, six branches, one promotion (the seventh hash at level 1), paths 3 3 3 3 3 3 2.

## Speaker note

- The table values are computed from the fold, not taken from the spec (the slide says so). Recomputed for 1 to 9 leaves: all rows and the reverse table match.
