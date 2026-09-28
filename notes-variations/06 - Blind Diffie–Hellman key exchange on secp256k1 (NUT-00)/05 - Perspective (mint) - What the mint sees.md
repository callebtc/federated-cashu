# 06.05 · What the mint sees

Variation 5 of slide 06 (Blind Diffie–Hellman key exchange on secp256k1 (NUT-00)) · lens: Perspective: mint · deck `fcv-a-bls` page 15 · 5 steps · script 114 words, about 50 s

## Script

**[1]** At issuance the mint receives a BlindedMessage: amount, keyset id and B′. B′ = Y + r·G with uniform r, so B′ is a uniformly random point.

**[2]** It returns C′ = k·B′, optionally with a DLEQ proof.

**[3]** At redemption it receives a Proof: amount, keyset id, the secret x and C.

**[4]** It computes Y = hash_to_curve(x) and checks k·Y = C. It checks that Y is unspent, then records Y.

**[5]** For every pair of B′ and Y there is exactly one r with B′ = Y + r·G. Every issuance is consistent with every redemption, so the mint cannot link the two records. Linking them would need r, and every r is equally likely.

## Background

- **BlindedMessage and Proof (NUT-00)**: the JSON objects for an output ({amount, id, B_}) and an input ({amount, id, secret, C}).
- **Uniform point**: if r is uniformly random, r·G is a uniformly random point, and adding the fixed point Y keeps it uniform. B′ therefore carries no information about Y.
- **Exactly one r**: B′ − Y is some point, and it equals r·G for exactly one r modulo the curve order. The mint cannot compute that r, and every candidate Y has one.
- **Spent set**: the mint stores Y for every redeemed proof and rejects a second proof with the same Y.
- **What the mint does see**: amounts and keyset IDs are visible at both ends. Unlinkability holds among outputs with the same amount and keyset.
