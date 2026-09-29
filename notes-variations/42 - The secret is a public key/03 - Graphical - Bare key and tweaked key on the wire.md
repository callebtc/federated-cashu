# 42.03 · Bare key and tweaked key on the wire

Variation 3 of slide 42 (The secret is a public key) · lens: Graphical · deck `fcv-h-nutroot-tree` page 5 · 5 steps · script 139 words, about 60 s

## Script

One internal key, two lanes: tweaked on top, bare below.

**[1]** The private key k times the generator G gives the internal key K = k·G.

**[2]** A tree of conditions is folded to a merkle root; K and the root give the tweak t.

**[3]** Tweaked lane: the secret is P = K + t·G. It commits to the conditions.

**[4]** Bare lane: the secret is K itself. Both lanes end in 33 bytes: 02d310a4… for the tweaked key, 03a3e12c… for the bare key, both from the spec's receiver-keyed vectors. Nothing in these bytes shows whether a tree exists.

**[5]** Y is hash_to_curve_G1 over the 33 bytes. A key-path spend is one BIP-340 signature, checked against the x-coordinate of the secret: by k for the bare key, by (k + t) mod n for the tweaked key. The mint cannot tell them apart.

## Background

- **Internal key K**: the public key the secret is built from. Without conditions it is the secret; with conditions it is tweaked.
- **Tweak t**: t = tagged_hash("Cashu_NutrootTweak", K ‖ root) mod n. It binds the tree's root to K.
- **Why the lanes look the same**: every secp256k1 point is 33 bytes, and P = K + t·G is an ordinary point. Without K and the root nobody can tell that a tweak was applied.
- **Signing key of P**: P = K + t·G = (k + t)·G, so the private key is (k + t) mod n. Its signature has the same format as any other BIP-340 signature.
- **x(secret)**: the 32-byte x-coordinate of the secret point, the value BIP-340 verification uses.
- **hash_to_curve_G1**: deterministic map from the 33 secret bytes to the point Y in BLS12-381 G₁, which the mint signs and later records as spent.

## Speaker note

- The tree icon has three leaves, but the tweaked value `02d310a4…9ef8f828` is the one-leaf tree (the single after leaf) of the receiver-keyed vector. Do not present it as the secret of a three-leaf tree.
- In that vector the private key of `03a3e12c…` is (3 + r₀) mod n, Carol's static key blinded at NUT-28 slot 0, not a small test key.
