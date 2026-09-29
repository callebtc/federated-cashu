# 15.06 · Collecting shares of a 3-of-5 key

Variation 6 of slide 15 (Shamir secret sharing, t = 2) · lens: Perspective: attacker · deck `fcv-b-threshold` page 16 · 4 steps · script 140 words, about 60 s

## Script

An attacker collects shares of a 3-of-5 key. The counting uses the toy field 𝔽₉₇. A polynomial of degree at most 2 has three coefficients, so there are 97³ of them. With no share known, each candidate secret k′ is the value at zero of 97² polynomials.

**[1]** One member compromised, j = 1. 97² polynomials fit the share, and every candidate k′ still fits 97 of them.

**[2]** Two members, j = 2. 97 polynomials fit, exactly one for every k′. All candidates remain equally likely, so nothing is learned about k.

**[3]** Three members, the threshold. One polynomial fits, and k is determined.

**[4]** With t shares, interpolation gives k = f(0), and the three can compute k·B′ for any B′ without the other members. The production profile therefore requires t > ⌊(n − 1)/3⌋, the number of faulty members consensus tolerates.

## Background

- **𝔽₉₇**: the integers modulo 97, a toy field that keeps the counts small. The real field 𝔽ᵣ has a 255-bit prime r, and the counts are powers of r.
- **Counting argument**: each known share at a distinct non-zero ID is one linear equation on the three coefficients and removes one factor of 97. Fixing f(0) = k′ is one more equation. Two shares plus k′ are three equations, so exactly one polynomial for every k′.
- **Nothing learned**: if every candidate k′ fits the same number of polynomials and the polynomial was chosen uniformly, the attacker's view is the same for every k′.
- **At the threshold**: three shares determine the polynomial, so k and the signing power follow. The attacker can sign without ordering. That is why t must exceed f = ⌊(n − 1)/3⌋, the number of Byzantine members the BFT model tolerates; for n = 5, f = 1.
- **validate_bft_safety**: the production check in `ThresholdParams`; it rejects t ≤ ⌊(n − 1)/3⌋ and c < n − ⌊(n − 1)/3⌋.

## Speaker note

- The counts (97³, 97², 97, 1 fitting polynomials; 97², 97, 1 per k′) follow from the linear-algebra argument; the same structure was reproduced by brute force over 𝔽₇.
