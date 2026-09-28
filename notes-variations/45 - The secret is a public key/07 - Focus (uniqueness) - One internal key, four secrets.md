# 45.07 · One internal key, four secrets

Variation 7 of slide 45 (The secret is a public key) · lens: Focus: uniqueness · deck `fcv-h-nutroot-tree` page 9 · 3 steps · script 139 words, about 60 s

## Script

**[1]** One internal key, 03a3e12c…, gives four secrets. With no tree the secret is K itself. With the empty tweak, the form an aggregated key must carry, it is 03231881…. With the single after leaf it is 02d310a4…, with the three-leaf tree 022d17fd…. The tweak hashes K with the root, so every tree gives another secret.

**[2]** Flipping the prefix byte, 03 to 02 with the same x-coordinate, gives another valid secret with its own Y. Signatures verify against x only, so one scalar spends both.

**[3]** Wallets should still use a fresh K per proof: seed-derived under NUT-13, a blinded static key under NUT-28, a random keypair, or a fresh NUMS offset u. A script-path spend reveals K and links proofs that share it. Reuse is invisible at issuance, because outputs are blinded; it surfaces when the first spend burns Y.

## Background

- **Uniqueness**: NUT-00 requires every secret to be unique. For v3 the secret is a key, so uniqueness comes from how keys are derived.
- **Empty tweak**: t = tagged_hash("Cashu_NutrootTweak", K), no root bytes. Required for aggregated keys (MuSig2, FROST) so cosigners can see that no script tree is hidden.
- **Same x, other prefix**: every valid x has two points, y and −y. `02‖x` and `03‖x` are different 33-byte secrets, so their Y differ, but BIP-340 verifies against x alone.
- **Blinded outputs**: the mint signs B_ = r·Y with a random r, so two outputs carrying the same secret have different B_ and look unrelated.
- **Burning Y**: the mint stores Y of every spent proof; a second proof with the same Y is refused as already spent.
- **NUMS offset**: K = H + u·G, where H is a point with no known private key. A fresh u per proof makes K unique while keeping the key path unusable.

## Speaker note

- The empty-tweak secret `03231881…12f79747` is computed for K = `03a3e12c…`, not a vector (the spec's empty-tweak vector uses K = key 3). Recomputed with the NUT-10 tags; it matches. The other three secrets are vector values.
