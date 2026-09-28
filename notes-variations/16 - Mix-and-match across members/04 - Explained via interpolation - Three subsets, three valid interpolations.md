# 16.04 · Three subsets, three valid interpolations

Variation 4 of slide 16 (Mix-and-match across members) · lens: Explained via interpolation · deck `fcv-c-ordering` page 6 · 5 steps · script 139 words, about 60 s

## Script

The attack in numbers, with all arithmetic modulo 23.

**[1]** The key k = 7 is shared on the line f(x) = 7 + 5x. Member i holds kᵢ = f(i): 12, 17 and 22. The weight λᵢ for signer set S is the product of j over j minus i, over the other j in S.

**[2]** Output A, blinded value b = 4, was signed by m1 and m3: shares 2 and 19, weights 13 and 11, weighted sum 5, which is 7 times 4 mod 23.

**[3]** B, b = 9, by m1 and m2: weights 2 and 22 give 17, 7 times 9.

**[4]** C, b = 15, by m2 and m3: weights 3 and 21 give 13, 7 times 15.

**[5]** Three subsets, three correct signatures. The weights depend only on S, never on the request a member answered.

## Background

- **Modulo 23**: every result is replaced by its remainder after division by 23. Division means multiplying by the modular inverse: 2⁻¹ = 12, because 2·12 = 24 ≡ 1.
- **Shamir sharing with t = 2**: the key is the value at x = 0 of a line f(x) = k + a·x. Member i gets f(i). Two points fix the line, one point reveals nothing about k.
- **Lagrange weights at x = 0**: λᵢ = ∏ j / (j − i) over the other members j in S. Worked example for S = {1, 3}: λ₁ = 3/(3 − 1) = 3·12 = 36 ≡ 13; λ₃ = 1/(1 − 3) = −12 ≡ 11. Check on the keys: 13·12 + 11·22 = 398 ≡ 7 = k.
- **Why the result is k·b**: each share is kᵢ·b, and multiplication distributes over the sum, so Σ λᵢ·kᵢ·b = (Σ λᵢ·kᵢ)·b = k·b.
- **Toy model**: scalars stand in for G1 points. b stands for a blinded output B′ and kᵢ·b for a share C′ᵢ = kᵢ·B′.

## Speaker note

- All values on this page were computed for the slide in a toy field, not taken from spec vectors. They were recomputed and are correct.
