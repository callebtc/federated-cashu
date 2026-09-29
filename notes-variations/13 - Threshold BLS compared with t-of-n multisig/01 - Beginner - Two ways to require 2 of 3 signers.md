# 13.01 · Two ways to require 2 of 3 signers

Variation 1 of slide 13 (Threshold BLS compared with t-of-n multisig) · lens: Beginner · deck `fcv-b-threshold` page 3 · 5 steps · script 138 words, about 60 s

## Script

Two ways to require two of three signers. Left: multisig on secp256k1. Right: threshold BLS on BLS12-381.

**[1]** Three members, m1 to m3. Any two should be able to issue.

**[2]** With multisig, every member has its own private key: k₁, k₂, k₃. With threshold BLS there is one private key k, split into shares. Member i holds f(i), a point on a polynomial with f(0) = k.

**[3]** m1 and m3 answer, m2 does not. Multisig yields two separate signatures, C₁ and C₃. Threshold BLS yields two shares, which are combined into one signature C.

**[4]** The token. Multisig: the secret x, two signatures, the three public keys and the 2-of-3 rule. Threshold BLS: x and C.

**[5]** The receiver. Multisig: check C₁ against K₁, C₃ against K₃, then the rule. Threshold BLS: one check of C against one public key K.

## Background

- **Private key k, public key K**: k is a secret number; K is the matching public point. A signature C made with k can be checked by anyone who knows K. kᵢ and Kᵢ are the same for member i.
- **Token secret x and signature C**: a Cashu proof is the secret x plus the mint's signature C on it. Whoever holds (x, C) holds the value.
- **Multisig (t-of-n)**: t separate signatures from a list of n keys, all included in the proof, plus the rule that says how many are needed.
- **Share f(i)**: the key k is the value at x = 0 of a random polynomial f; member i stores f(i). Any two shares determine f and therefore k; one share alone reveals nothing about k (Shamir secret sharing, next slides).
- **Combining shares**: the wallet multiplies each member's response by a weight that depends only on which members answered, and adds the results (Lagrange interpolation). The sum equals what the single key k would have produced.
- **secp256k1 and BLS12-381**: secp256k1 is Bitcoin's curve, used by today's Cashu keysets. BLS12-381 is a pairing-friendly curve used by v3 keysets; its pairing lets anyone check a signature against K.
