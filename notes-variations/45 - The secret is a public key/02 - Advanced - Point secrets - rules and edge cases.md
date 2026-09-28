# 45.02 · Point secrets: rules and edge cases

Variation 2 of slide 45 (The secret is a public key) · lens: Advanced · deck `fcv-h-nutroot-tree` page 4 · 4 steps · script 140 words, about 60 s

## Script

**[1]** Encoding. On keysets with version 02 or later, mints reject any secret but a 33-byte compressed point. On 00 and 01 keysets a point-shaped string stays a random string: the version selects the rules. v3 Y is in BLS12-381 G₁, pre-v3 Y on secp256k1, so they never collide.

**[2]** Key path. Exactly one BIP-340 signature against the secret's x-coordinate: by k when bare, by (k + t) mod n when tweaked. t is reduced mod n; BIP341 rejects a tweak at or above n.

**[3]** Aliasing. 02‖x and 03‖x are two secrets with separate Y, yet one scalar key-path spends both: an x-only key does not identify one proof.

**[4]** An aggregated K carries at least the empty tweak. v3 derivations are hardened at every step. Wallets should check new secrets against used ones: reuse surfaces only when the first spend burns Y.

## Background

- **MUST, MUST NOT, SHOULD**: requirement keywords in the spec (RFC 2119). MUST is mandatory, SHOULD is recommended unless there is a specific reason not to.
- **Keyset version byte**: `00` and `01` are pre-v3 keysets with string secrets; `02` is v3, with BLS blind signatures and point secrets.
- **Two departures from BIP341**: (1) BIP341 fails when the tweak hash is at or above n; nutroot reduces it mod n. (2) BIP341 output keys are 32-byte x-only keys, so the prefix question does not arise; nutroot secrets are 33-byte points whose identity includes the prefix, while signatures still verify x-only.
- **x-only verification**: BIP-340 treats a public key as its x-coordinate with even y. A signer whose point has odd y negates its private key. So `02‖x` and `03‖x` accept the same signatures.
- **Empty tweak**: t = tagged_hash("Cashu_NutrootTweak", K) with no root. It proves to cosigners of an aggregated key (MuSig2, FROST) that no script tree is hidden in the key.
- **Hardened derivation (BIP32)**: a hardened child is computed from the parent private key. With non-hardened derivation, one child private key plus the parent xpub reveals the parent private key and every sibling. v3 private keys can travel in tokens, so every step must be hardened.
- **Reuse at issuance**: outputs are blinded (B_ = r·Y), so two outputs with the same secret look unrelated to the mint. The duplicate shows only when the second proof is refused because its Y is already spent.
