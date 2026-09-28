# 14.06 · Which members must be online, n = 5

Variation 6 of slide 14 (Threshold blind signing) · lens: Framing: liveness · deck `fcv-b-threshold` page 33 · 4 steps · script 128 words, about 55 s

## Script

Which members must be online, for n = 5, t = 3 and c = 4. The columns: online members, ordering, shares, issuance.

**[1]** All five online. Ordering: 5 ≥ 4. Shares: 5 ≥ 3. Issuance works: any 3 of the 5 responses, 10 subsets, one C.

**[2]** m4 offline. 4 ≥ 4 and 4 ≥ 3. Issuance works, from 4 subsets of three.

**[3]** m4 and m5 offline. Three members would suffice for the shares, but ordering needs four. No operation is accepted, so no member signs, and there is no issuance.

**[4]** Two online: neither ordering nor shares.

Members sign only after the operation is accepted. Issuance therefore needs c members for ordering and t responses. The model sets c = n − ⌊(n − 1)/3⌋, with t ≤ c.

## Background

- **Liveness**: whether the federation can still make progress, here issue tokens.
- **c, consensus threshold**: members needed to accept an operation into the common order. c = n − ⌊(n − 1)/3⌋; for n = 5, ⌊4/3⌋ = 1 and c = 4.
- **t, signature threshold**: shares needed to interpolate a signature.
- **Subsets**: 3 of 5 can be chosen in 10 ways, 3 of 4 in 4 ways. Every subset of t valid shares yields the same C.
- **t ≤ c**: enforced by `ThresholdParams::validate`. t < c is safe because an honest member signs only accepted operations, and acceptance needs c members.
