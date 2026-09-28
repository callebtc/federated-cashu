# 51.03 · Three internal keys, three key paths

Variation 3 of slide 51 (Three forms of internal key) · lens: Graphical · deck `fcv-i-nutroot-spend` page 21 · 3 steps · script 104 words, about 45 s

## Script

**[1]** One holder. k times G gives K, and the secret is K itself. The holder signs with k directly. That signature is the key path.

**[2]** Cosigners. Two private keys, k₁ and k₂, contribute to one aggregate key K. K plus t·G, with t a hash of K alone, gives the secret. Neither party can sign alone: the key path is a joint signature.

**[3]** Nobody. H has an unknown discrete log. H plus u·G gives K, and K plus t·G gives the secret. No known scalar leads to the secret, so there is no key path. A leaf is the only way to spend it.

## Background

- **Discrete log (dl)**: the scalar x with X = x·G. Computing it from X is infeasible on secp256k1.
- **Aggregation**: MuSig2 computes K from the participants' public keys with per-key coefficients; a FROST group key comes from distributed key generation. The figure only shows that both parties contribute.
- **Joint signature**: MuSig2 and FROST output one ordinary BIP-340 signature for K's tweaked key. The mint cannot tell it from a single-signer signature.
- **Empty tweak**: t = tagged_hash("Cashu_NutrootTweak", K), no root bytes, required for aggregated keys.
- **Script-only**: a secret over a NUMS key; the tree's leaves are the only spend paths. In panel three, t is the tweak over K and the tree's root.
