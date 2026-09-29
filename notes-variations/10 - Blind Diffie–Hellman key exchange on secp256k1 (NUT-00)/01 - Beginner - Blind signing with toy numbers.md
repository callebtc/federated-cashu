# 10.01 · Blind signing with toy numbers

Variation 1 of slide 10 (Blind Diffie–Hellman key exchange on secp256k1 (NUT-00)) · lens: Beginner · deck `fcv-a-bls` page 11 · 5 steps · script 140 words, about 60 s

## Script

A toy group with 13 points, 0·G to 12·G. Adding points adds their multiples, mod 13. On secp256k1 there are about 2²⁵⁶ points, and the multiple behind a point cannot be recovered from the point.

**[1]** The wallet hashes its secret x to a point: Y = 5·G.

**[2]** It picks the blinding factor r = 3 and sends B′ = Y + r·G = 8·G.

**[3]** The mint multiplies by its private key k = 7. 7 times 8 is 56, which is 4 mod 13, so C′ = 4·G.

**[4]** The wallet subtracts r·K, using the public key K = 7·G. 4 minus 21 is −17, which is 9 mod 13, so C = 9·G.

**[5]** At redemption the mint checks k·Y. 7 times 5 is 35, which is 9 mod 13. It matches C. This last check uses the private key k.

## Background

- **Group of points**: a set of points with an addition rule. G is a fixed base point; a·G means G added to itself a times. In the toy group a is taken mod 13, so 13·G = 0·G.
- **mod 13**: the remainder after division by 13. 56 = 4·13 + 4, so 56 mod 13 = 4. −17 + 26 = 9, so −17 mod 13 = 9.
- **Discrete logarithm**: recovering a from a·G. Trivial in the toy group, infeasible on secp256k1. This is why the mint's k stays secret although K = k·G is public.
- **hash_to_curve**: turns the secret x into a point Y whose multiple nobody knows.
- **Blinding factor r**: a random number known only to the wallet. B′ = Y + r·G hides Y from the mint.
- **Why unblinding works**: C′ = k·(Y + r·G) = k·Y + r·(k·G) = k·Y + r·K. Subtracting r·K leaves k·Y. In the toy group: 4 − 3·7 = 9 = 7·5.
