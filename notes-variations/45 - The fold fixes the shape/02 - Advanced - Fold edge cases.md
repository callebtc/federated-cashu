# 45.02 · Fold edge cases

Variation 2 of slide 45 (The fold fixes the shape) · lens: Advanced · deck `fcv-h-nutroot-tree` page 29 · 3 steps · script 139 words, about 60 s

## Script

Six edge cases of the normative fold.

**[1]** One leaf: the root is the leaf hash and the path is empty. In the vectors the single after leaf gives root 9ed9c0b8…. Odd count: the unpaired last hash is promoted unchanged, never hashed with itself. Bitcoin's transaction merkle tree duplicates the last hash instead.

**[2]** Duplicate leaves are kept; the fold must not deduplicate. Two copies give root branch(h, h), 1eaf2914…, not h. A permuted list gives the same root and must be treated as equivalent; nothing is derived from a leaf's position. Every order of the three-leaf vector gives 3d4fbecf….

**[3]** Nine or more leaves are rejected outright, even though promotion gives one of nine leaves a path of one; the other eight would have paths of four. A path with more than three hashes is rejected first, before anything is recomputed.

## Background

- **Normative fold**: the tree construction every implementation must follow exactly: sort leaf hashes, pair per level, promote an unpaired last hash.
- **Bitcoin's block merkle tree**: pairs transaction IDs in order and, on an odd count, hashes the last one with a copy of itself. As a result two different transaction lists can give the same root (CVE-2012-2459). The nutroot fold never duplicates a hash.
- **branch(h, h)**: tagged_hash("Cashu_NutrootBranch", h ‖ h). It differs from h, so a tree with two copies has a different root and secret than a tree with one.
- **Position independence**: NUT-28 matches blinded keys by value, never by position, because the fold does not preserve the transmitted order.
- **Nine leaves**: level 1 has four branches and one promotion, level 2 two branches and one promotion, level 3 one branch and one promotion, level 4 the root. Eight leaves reach depth 4.
- **Path check first**: the verifier rejects a path longer than 3 before it hashes anything.
