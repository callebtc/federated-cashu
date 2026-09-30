# 11.02 · NUT-00 BDHKE: encoding, algebra, DLEQ

Variation 2 of slide 11 (Blind Diffie–Hellman key exchange on secp256k1 (NUT-00)) · lens: Advanced · deck `fcv-a-bls` page 12 · 4 steps · script 137 words, about 60 s

## Script

**[1]** hash_to_curve: msg_hash is SHA-256 of the tag Secp256k1_HashToCurve_Cashu_ and x. Y has prefix 02 and x-coordinate SHA-256 of msg_hash and a little-endian 32-bit counter, incremented until valid. CDK stops after 2¹⁶ attempts.

**[2]** Unblinding uses only the published K: C′ − r·K = k·Y. If the mint signed with k′ ≠ k, the wallet gets k′·Y + r·(k′ − k)·G, valid under neither key.

**[3]** Only the holder of k can test k·Y = C. NUT-12 adds a DLEQ proof that one k links K = k·G and C′ = k·B′. The verifier recomputes R₁ and R₂ and checks the challenge e. Optional on v1 and v2.

**[4]** Failure modes. A DLEQ nonce reused across two challenges reveals k. A repeated secret gives the same Y and is rejected as spent. Without DLEQ, a wrong-key C′ goes unnoticed until redemption.

## Background

- **Try-and-increment**: hash, test whether the 32 bytes are the x-coordinate of a curve point, and if not, increment the counter and hash again. About half of all 32-byte values are valid x-coordinates, so a few attempts usually suffice.
- **Prefix 02**: in SEC1 compressed encoding, 02 means the point with even y and 03 odd y. hash_to_curve always picks the even one.
- **DLEQ proof (discrete logarithm equality, NUT-12)**: the mint picks a nonce p and computes R₁ = p·G, R₂ = p·B′, e = hash(R₁, R₂, A, C′) and s = p + e·a. The verifier recomputes R₁ = s·G − e·A and R₂ = s·B′ − e·C′ and checks that hashing them gives e. NUT-12 names the key a and A, and the nonce r.
- **Nonce reuse**: two proofs with the same nonce p give s₁ − s₂ = (e₁ − e₂)·k, so k = (s₁ − s₂)·(e₁ − e₂)⁻¹. NUT-12 recommends a deterministic nonce, HMAC-SHA256 keyed with the private key over the proof inputs and a counter, rejection-sampled into range.
- **Wrong-key signature**: the wallet unblinds with K, so a C′ made with another key does not unblind to k′·Y. The error only appears when the mint checks the proof at redemption.
- **Repeated secret**: the mint keeps the set of spent Y values; a second proof with the same secret has the same Y and is rejected.

## Speaker note

- In nuts#443, NUT-00 labels this secp256k1 protocol as legacy and deprecated; it applies only to keysets with version byte 00 or 01.
- The 2¹⁶ limit is a CDK implementation detail (`crates/cashu/src/dhke.rs`), not part of NUT-00.
