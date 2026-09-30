# 23.03 · Rows are sent, columns are summed

Variation 3 of slide 23 (Distributed key generation) · lens: Graphical · deck `fcv-d-flows-dkg` page 21 · 5 steps · script 134 words, about 55 s

## Script

The same toy ceremony drawn as a grid: t = 2, three members. Row j belongs to sender j, column i to receiver i.

**[1]** Each cell is the value fⱼ(i). Row 1 is what m1 sends: 5, 6 and 7.

**[2]** Column i is what member i receives: one value from every member, its own included.

**[3]** Each member sums its column. The sums 21, 33 and 45 are the shares k₁, k₂ and k₃.

**[4]** The column at x = 0 holds the constant terms 4, 2 and 3. These values are never sent. Their sum, 9, is the joint secret k, and nobody computes it.

**[5]** The public column holds the commitments to those constant terms, Aⱼ,₀ = aⱼ,₀·G₂. They are published, and anyone can add them. Their sum is the public key K = k·G₂.

## Background

- **fⱼ(i)**: the value of member j's polynomial at member i's ID, delivered privately from j to i.
- **Share kᵢ**: the column sum Σⱼ fⱼ(i), which equals f(i) for the summed polynomial f.
- **Aⱼ,₀ = aⱼ,₀·G₂**: member j's constant term multiplied by the generator G₂ of the BLS12-381 group G₂. The point can be published because the scalar cannot be recovered from it.
- **Why the public column sums to K**: point multiplication is linear, so Σⱼ aⱼ,₀·G₂ = (Σⱼ aⱼ,₀)·G₂ = k·G₂ = K. The sum of points is computed; the sum of scalars is not.

## Speaker note

- Same toy numbers as the beginner page, chosen for the slide; not test vectors.
