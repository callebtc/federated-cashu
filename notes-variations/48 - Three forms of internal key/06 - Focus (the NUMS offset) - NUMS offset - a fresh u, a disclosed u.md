# 48.06 · NUMS offset: a fresh u, a disclosed u

Variation 6 of slide 48 (Three forms of internal key) · lens: Focus: the NUMS offset · deck `fcv-i-nutroot-spend` page 24 · 4 steps · script 138 words, about 60 s

## Script

**[1]** H is lift_x of SHA-256 over G's 65-byte uncompressed encoding, 0250929b…. Its x-coordinate is a hash output. Nobody chose a scalar for it, so nobody knows its discrete log.

**[2]** K = H + u·G. Its discrete log is that of H plus u, still unknown. With u = 7, K is 028edfeb…. K plus t·G gives the secret P, which has no key path.

**[3]** u must be fresh per proof, because secrets must be unique: the same K and tree repeat the secret and its Y, and only the first spend succeeds. Seeded wallets may derive u from the proof counter.

**[4]** u must be disclosed. Without it, K looks like any key, and the holder cannot rule out a key path. With it, anyone checks K − 7·G = 0250929b… = H. A NUMS key is never ECDH-blinded.

## Background

- **NUMS**: "nothing up my sleeve", a point derived publicly from a hash, so no one can have chosen its private key.
- **lift_x**: the point with the given x-coordinate and even y; hence the 02 prefix of H.
- **Discrete log**: dl(X) is the scalar x with X = x·G. If someone knew dl(K), they would know dl(H) = dl(K) − u.
- **BIP341 origin**: BIP341 recommends H + r·G with a fresh r as internal key, and revealing r to prove that no key path exists.
- **Fresh u and privacy**: with one shared K, script-path spends revealing it would also link the proofs. A fresh u makes every K different.
- **Never ECDH-blinded (NUT-28)**: blinding needs the receiver's private key for the Diffie–Hellman step; nobody holds H's.
