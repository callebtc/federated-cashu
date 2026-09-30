# 15.01 · Threshold signing with toy numbers

Variation 1 of slide 15 (Threshold blind signing) · lens: Beginner · deck `fcv-b-threshold` page 28 · 6 steps · script 139 words, about 60 s

## Script

Threshold signing with toy integers. The key is k = 7; member i holds kᵢ = 7 + 3i: 10, 13 and 16. Real scalars are elements of 𝔽ᵣ.

**[1]** The wallet hashes its secret x to a point, Y = H(x). Every point below is a multiple of Y.

**[2]** It blinds with a random r = 5: B′ = r·Y = 5·Y. Members see only B′.

**[3]** m1 and m3 multiply B′ by their shares: C′₁ = 10·B′ = 50·Y and C′₃ = 16·B′ = 80·Y. m2 does not answer.

**[4]** The wallet combines them with the weights for IDs 1 and 3, 3/2 and −1/2: 75·Y − 40·Y = 35·Y.

**[5]** Unblinding with r⁻¹: 35·Y divided by 5 is 7·Y, which is k·Y.

**[6]** No member used k = 7. (x, C) is what a single mint with key 7 would issue.

## Background

- **Y = H(x)**: hash-to-curve; turns the secret x into a curve point.
- **Blinding factor r**: a random number the wallet keeps. B′ = r·Y hides Y from the members.
- **Share kᵢ**: member i's value on the line f(x) = 7 + 3x.
- **Weights 3/2 and −1/2**: λ₁ = 3/(3 − 1) and λ₃ = 1/(1 − 3). They give 3/2·10 − 1/2·16 = 7.
- **r⁻¹**: the inverse of r; multiplying by it removes the blinding. In 𝔽ᵣ it is the modular inverse, here written as division by 5.
- **Signature C = k·Y**: the ordinary v3 signature on x, checkable by anyone with K = k·G₂.

## Speaker note

- The chain 50·Y, 80·Y, 75·Y − 40·Y = 35·Y, 35/5 = 7 was recomputed with python3. Correct.
