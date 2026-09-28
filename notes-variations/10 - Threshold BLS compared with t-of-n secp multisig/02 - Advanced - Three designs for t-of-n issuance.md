# 10.02 · Three designs for t-of-n issuance

Variation 2 of slide 10 (Threshold BLS compared with t-of-n secp multisig) · lens: Advanced · deck `fcv-b-threshold` page 4 · 4 steps · script 136 words, about 60 s

## Script

Three designs for t-of-n issuance, compared row by row.

**[1]** Bare secp multisig. Each member has its own key kᵢ and returns C′ᵢ = kᵢ·B′ with a DLEQ proof. The proof carries x, t signatures, roster and policy; a receiver runs t DLEQ checks.

**[2]** Interpolated secp DHKE. One key k, Shamir-shared. Members return kᵢ·B′, checkable by DLEQ against Kᵢ, and the wallet interpolates one C under one K = k·G. But checking C offline needs a DLEQ under K, and producing it needs k. Nobody holds k, so this requires a threshold DLEQ, a new protocol.

**[3]** Threshold BLS. The same sharing over 𝔽ᵣ. Shares are G₁ points, checked with e(C′ᵢ, G₂) = e(B′, Kᵢ).

**[4]** The same pairing equation checks the result against K. That is the difference. NUT-12 forbids a dleq field on v3 signatures and proofs.

## Background

- **DHKE (NUT-00)**: blind Diffie–Hellman key exchange on secp256k1, today's Cashu signature. The wallet sends B′ = Y + r·G, the mint returns C′ = k·B′, the wallet unblinds C = C′ − r·K. The mint verifies a proof at redemption by recomputing k·Y, which also needs k.
- **DLEQ proof (NUT-12)**: a proof that the same secret k links K = k·G and C′ = k·B′ (equal discrete logarithms), without revealing k. It lets a wallet or receiver check a secp signature offline. Producing it requires k.
- **Threshold DLEQ**: the members would have to produce one DLEQ proof under K jointly from their shares. That is an additional multi-party protocol the federation would have to specify and run; the slide calls it a new protocol.
- **Interpolation**: combining t shares kᵢ·B′ with Lagrange weights gives k·B′ without anyone knowing k (section 1.2).
- **𝔽ᵣ**: the integers modulo r, the prime order of the BLS12-381 groups. Keys and shares are elements of it.
- **Pairing check**: e(C′ᵢ, G₂) = e(B′, Kᵢ) holds exactly when C′ᵢ = kᵢ·B′, given Kᵢ = kᵢ·G₂, and uses only public points. With (C, Y, K) in place of (C′ᵢ, B′, Kᵢ) the same equation checks the final signature.
- **NUT-12 rule**: for keysets with version byte 02 (BLS12-381), mints MUST NOT include a dleq field in BlindSignature responses and wallets MUST NOT include one in Proof objects.
