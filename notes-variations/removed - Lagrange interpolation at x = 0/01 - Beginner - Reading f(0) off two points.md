# removed.01 · Reading f(0) off two points

Variation 1 of slide removed (Lagrange interpolation at x = 0) · lens: Beginner · deck `fcv-b-threshold` page 20 · 5 steps · script 136 words, about 60 s

## Script

Reading f(0) off two points. The line is f(x) = 7 + 3x, so the secret is k = f(0) = 7.

**[1]** Two members report their values: f(1) = 10 from m1 and f(2) = 13 from m2.

**[2]** The slope is rise over run: (13 − 10)/(2 − 1) = 3.

**[3]** Walking back one step, from x = 1 to x = 0: f(0) = 10 − 3 = 7.

**[4]** Rewritten: f(0) = 10 − (13 − 10) = 2·10 − 1·13, a weighted sum of the two values. The weights, λ₁ = 2 and λ₂ = −1, are the Lagrange weights.

**[5]** If m1 and m3 answer instead, with IDs 1 and 3, the weights are 3/2 and −1/2: 1.5·10 − 0.5·16 = 7. The weights depend only on which IDs answered, not on the values.

## Background

- **f(i)**: the share of member i, the height of the line at x = i.
- **Slope**: how much f grows per step in x: (f(2) − f(1))/(2 − 1).
- **Lagrange weight λᵢ**: the number that multiplies member i's value so that the sum is f(0). For two members i and j: λᵢ = j/(j − i). IDs 1 and 2: λ₁ = 2/1 = 2, λ₂ = 1/(−1) = −1. IDs 1 and 3: λ₁ = 3/2, λ₃ = 1/(−2) = −1/2.
- **Why the weights ignore the values**: the formula uses only the IDs, so the wallet can compute the weights as soon as it knows who answered.
- **Why this matters**: members return their share multiplied onto a curve point, kᵢ·B′. The same weights applied to those points give k·B′ (next slides).
