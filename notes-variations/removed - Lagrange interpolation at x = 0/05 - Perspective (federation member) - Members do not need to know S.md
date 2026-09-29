# removed.05 · Members do not need to know S

Variation 5 of slide removed (Lagrange interpolation at x = 0) · lens: Perspective: federation member · deck `fcv-b-threshold` page 24 · 4 steps · script 138 words, about 60 s

## Script

Members do not need to know which other members will answer. Two scenarios, with f(x) = 3 + 1.2x and k = 3. Top: S = {1, 2}. Bottom: S = {1, 3}.

**[1]** m1 answers with C′₁ = k₁·B′ = 4.2·B′. It does not know who else will answer.

**[2]** Top: m2 also answers, with 5.4·B′, and m3 stays silent. S = {1, 2}, so the wallet weights C′₁ by 2: 2·C′₁ − 1·C′₂ = 3·B′.

**[3]** Bottom: m3 answers instead, with 6.6·B′. S = {1, 3}, and the weight of C′₁ is 3/2: 1.5·C′₁ − 0.5·C′₃ = 3·B′. m1's response is the same in both cases.

**[4]** The wallet applies the weights after it sees who answered. A member that weighted its own share would need S before answering. Because the wallet does it, members need no agreement on S.

## Background

- **S**: the set of members whose shares the wallet combines.
- **Why the response does not depend on S**: a member returns kᵢ·B′, which uses only its own share. The weight λᵢ depends on S and is applied by the wallet.
- **Lagrange weights**: S = {1, 2}: 2 and −1. S = {1, 3}: 3/2 and −1/2.
- **Consequence**: the wallet can use whichever t valid responses it has; a silent member does not force the others to answer again.
