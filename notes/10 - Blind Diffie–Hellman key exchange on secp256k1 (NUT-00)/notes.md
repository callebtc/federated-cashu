# 10 · Blind Diffie–Hellman key exchange on secp256k1 (NUT-00)

1.1 BLS blind signatures · 7 steps · script 139 words, about 60 s

## Script

**[1]** This is the blind signature scheme Cashu uses today, from NUT-00. The wallet picks a random secret x and hashes it to a curve point Y.

**[2]** It blinds Y by adding r·G, where r is a random number only the wallet knows.

**[3]** It sends B′ to the mint. B′ cannot be linked to Y.

**[4]** The mint multiplies B′ by its private key k **[5]** and returns C′.

**[6]** The wallet subtracts r times the mint's public key K and is left with C = k·Y: a signature on x that the mint has never seen.

**[7]** To redeem, the wallet sends x and C. The mint recomputes k·Y and compares. That check needs k. A wallet can only check a signature if the mint adds a DLEQ proof. With k split across members, every redemption check would become an interactive threshold computation.

## Background

- **secp256k1**: the elliptic curve Bitcoin uses. Points on it can be added. Multiplying a point by a whole number (a "scalar") means adding the point to itself that many times. Computing k·G from k is fast; recovering k from k·G is infeasible. This is the discrete logarithm problem.
- **G**: a fixed, publicly known base point. A public key is K = k·G for a private key k.
- **hash_to_curve**: a function that turns arbitrary bytes into a curve point, in a way that nobody knows the private key of that point.
- **Blinding**: randomizing the message before it is signed, so the signer cannot recognize it later. Here Y + r·G is a uniformly random point to the mint.
- **Why unblinding works**: C′ = k·(Y + r·G) = k·Y + r·(k·G) = k·Y + r·K. Subtracting r·K leaves k·Y.
- **DLEQ proof (NUT-12)**: "discrete logarithm equality". A short proof that the same k was used in K = k·G and in C′ = k·B′, without revealing k. It lets a wallet check a signature without the private key.
