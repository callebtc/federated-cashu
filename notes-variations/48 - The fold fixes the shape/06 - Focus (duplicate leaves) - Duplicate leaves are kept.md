# 48.06 · Duplicate leaves are kept

Variation 6 of slide 48 (The fold fixes the shape) · lens: Focus: duplicate leaves · deck `fcv-h-nutroot-tree` page 33 · 5 steps · script 106 words, about 45 s

## Script

Duplicate leaves, from the vectors. Left: as specified. Right: what a deduplicating wallet computes.

**[1]** Two identical threshold leaves, threshold_1of1_key3, under internal key 6.

**[2]** Both hash to the same h, 23e8ff16….

**[3]** The fold keeps both copies and pairs them. The root is branch(h, h), 1eaf2914…, distinct from h. With K = key 6 the secret is 03dd2f11…. These are vector values.

**[4]** A wallet that deduplicates keeps one copy. Its root is h itself, and its secret is 02d40875…, a different point. Check 1 fails on a valid proof, and the wallet rejects it.

**[5]** Either copy spends with the other copy's hash as its path: path = 23e8ff16….

## Background

- **Deduplication**: removing repeated items from a list. The spec forbids it in the fold: the fold MUST NOT deduplicate.
- **branch(h, h)**: tagged_hash("Cashu_NutrootBranch", h ‖ h); min and max are both h.
- **Why it matters**: the secret commits to the root. A wallet computing a different root computes a different secret and rejects a proof that other implementations accept.
- **Path for a copy**: its sibling is the other copy, whose hash is also h, so the path is [h].
- **Key 6**: the vector's internal key, `03fff97b…60297556`.

## Speaker note

- The deduplicated secret `02d40875…61e17428` is computed, not a vector (the slide says so). Recomputed: it matches.
