# 48.05 · The empty tweak, from a cosigner's side

Variation 5 of slide 48 (Three forms of internal key) · lens: Perspective: cosigner · deck `fcv-i-nutroot-spend` page 23 · 4 steps · script 137 words, about 60 s

## Script

**[1]** Alice and Mallory aggregate by summing keys, with proofs of possession. Alice sends A.

**[2]** Mallory builds a leaf only she satisfies: threshold, n = 1, key M₀. With K′ = A + M₀ and t the tweak of that tree over K′, she announces M = M₀ + t·G. She knows its scalar, so her proof of possession is valid.

**[3]** Without the rule, both compute K = A + M = K′ + t·G, a plain aggregate to Alice. With secret K, Mallory spends alone by script path: her leaf, control K′ with an empty path, her signature.

**[4]** With the rule, the secret is K plus its empty tweak, which Alice recomputes from the K she aggregated. That tweak commits to K with no root. Mallory's tree leads only to K, so no leaf opens the secret.

## Background

- **Proof of possession**: a signature showing the sender knows the private key of the key it announces. It stops key cancellation, not this attack: Mallory does know M's scalar, M₀'s scalar plus t.
- **MSDL-pop**: aggregation as the plain sum of keys, protected by proofs of possession. BIP341 uses it for this example.
- **Why the hidden path works**: K′ + t·G = A + M₀ + t·G = A + M = K, so a script-path witness with control K′ verifies against the secret K.
- **MuSig**: aggregation with per-key coefficients; BIP341 notes it already randomizes the internal key. Nutroot still requires the empty tweak for every aggregated key.
- **Empty tweak**: tagged_hash("Cashu_NutrootTweak", K), no root bytes. The secret K + t·G then commits to K itself.

## Speaker note

- BIP341's own text is the source (footnote on why an output key should always have a taproot commitment). The nutroot rule is NUT-10's "MUST carry at least the empty tweak" for aggregated keys.
