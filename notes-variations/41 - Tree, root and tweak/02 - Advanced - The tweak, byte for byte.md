# 41.02 · The tweak, byte for byte

Variation 2 of slide 41 (Tree, root and tweak) · lens: Advanced · deck `fcv-h-nutroot-tree` page 12 · 5 steps · script 140 words, about 60 s

## Script

**[1]** Each tag hashes once to 32 bytes. A tagged hash puts that value twice before the message and hashes again.

**[2]** The tweak message is 129 bytes: the tag hash twice, K as a 33-byte compressed point, and the 32-byte root, here of the three-leaf vector.

**[3]** Against BIP341's TapTweak: BIP341 hashes the 32-byte x-only internal key and fails when the tweak is n or more. Nutroot hashes the full 33-byte K and reduces mod n, never rejecting.

**[4]** Without a tree the message is K alone, the empty tweak, which an aggregated K must carry. Vector with K = key 3: t = 764c0e0d….

**[5]** The secret is P = K + t·G; the key-path signer uses p′ = (k + t) mod n. Three-leaf vector: t = ea08208d…, P = 022d17fd…. BIP-340 signing negates the scalar when the point has odd y.

## Background

- **Tag hash**: SHA256 of the tag's UTF-8 bytes. Implementations precompute it once per tag.
- **129 bytes**: 32 + 32 (tag hash twice) + 33 (K) + 32 (root). For the empty tweak it is 97 bytes.
- **Reduction mod n**: n is the secp256k1 group order, slightly below 2²⁵⁶. A SHA-256 digest is at or above n with probability of roughly 2⁻¹²⁸. BIP341 fails in that case; nutroot takes the remainder, which removes a failure path.
- **Why 33 bytes of K**: the secret's identity includes its prefix byte, and hashing the full compressed K binds that byte too.
- **Empty tweak**: t = tagged_hash("Cashu_NutrootTweak", K). Cosigners of a MuSig2 or FROST key check it to confirm that no script tree is hidden in the key.
- **BIP-340 negation**: BIP-340 public keys are x-only with even y. If (k + t)·G has odd y, the signer signs with n − p′ instead; the vector secret `022d17fd…` has even y, so no negation applies to it.

## Speaker note

- The three-leaf tweak `ea08208d…6bf26eaf` is not printed in `tests/10-tests.md` (the vector lists root and secret only). It was derived from the vector's K and root; recomputed, and K + t·G gives the vector secret `022d17fd…`. The empty-tweak t and secret are vector values.
