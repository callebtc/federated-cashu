# 39.07 · Why the condition lives inside the secret

Variation 7 of slide 39 (NUT-10 well-known secrets) · lens: Framing: the constraint that forces the design · deck `fcv-g-json-taproot` page 9 · 5 steps · script 140 words, about 60 s

## Script

Two parties: the wallet and the mint.

**[1]** Issuance is blind. The wallet sends B′ = Y + r·G, where r is a random blinding factor. The mint returns C′ = k·B′. It sees only B′, never the secret.

**[2]** The wallet unblinds: C = C′ − r·K = k·Y, where K = k·G is the mint's public key and Y = hash_to_curve(secret).

**[3]** C binds exactly the bytes behind Y, nothing else. Any condition the mint enforces later must be inside those bytes.

**[4]** At redemption, possibly by a different holder, the wallet sends the secret, C and the witness. The mint sees the policy for the first time: it parses the kind, enforces data and tags, and checks the witness.

**[5]** Three consequences: the full policy is revealed at redemption, the secret grows with the policy, and the mint must support the kind.

## Background

- **Blind Diffie–Hellman key exchange (pre-v3 NUT-00)**: the wallet blinds Y, the mint multiplies by its private key k, the wallet removes the blinding. The mint signs without seeing Y or the secret.
- **Blinding factor r**: a random scalar known only to the wallet. Y + r·G is a uniformly random point to the mint.
- **Unblinding**: C′ = k·(Y + r·G) = k·Y + r·K. Subtracting r·K leaves k·Y.
- **Why not a separate field**: C covers only Y. A condition in any other proof field would not be signed, and any holder could remove it without breaking C.
- **Nutroot, for contrast (NUT-10, v3)**: the secret is a public key that commits to the conditions through a tweak, so the policy is revealed only when a script path is used.
