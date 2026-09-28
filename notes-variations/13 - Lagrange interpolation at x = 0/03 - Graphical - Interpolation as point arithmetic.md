# 13.03 · Interpolation as point arithmetic

Variation 3 of slide 13 (Lagrange interpolation at x = 0) · lens: Graphical · deck `fcv-b-threshold` page 22 · 4 steps · script 104 words, about 45 s

## Script

Interpolation drawn as point arithmetic. Each share is C′ᵢ = f(i)·B′, with f(x) = 3 + 1.2x. Each axis shows the multiples of B′, one axis per responding set: {1, 2}, {1, 3} and {2, 3}.

**[1]** The shares sit at 4.2, 5.4 and 6.6 times B′.

**[2]** S = {1, 2}: 2·C′₁ goes out to 8.4·B′, then −1·C′₂ comes back to 3·B′.

**[3]** S = {1, 3}: 1.5·C′₁ reaches 6.3·B′, then −0.5·C′₃ returns to 3·B′.

**[4]** S = {2, 3}: 3·C′₂ goes out to 16.2·B′, and −2·C′₃ returns to 3·B′. Three subsets take three different paths and end at the same point: C′ = 3·B′ = k·B′.

## Background

- **Multiples of B′**: in the drawing, a point a·B′ is placed at position a. Adding points adds positions; multiplying by a number scales the position.
- **Why the endpoint is the same**: λᵢ·C′ᵢ = λᵢ·f(i)·B′, and Σ λᵢ·f(i) = f(0) = 3 for any two IDs.
- **Real groups**: in G₁ the multiples of B′ do not lie on a line, and a·B′ does not reveal a. The drawing shows only the linear arithmetic.
- **Weights**: {1, 2}: 2 and −1. {1, 3}: 3/2 and −1/2. {2, 3}: 3 and −2.

## Speaker note

- The intermediate positions were recomputed with python3: 8.4 − 5.4, 6.3 − 3.3 and 16.2 − 13.2 all equal 3.
