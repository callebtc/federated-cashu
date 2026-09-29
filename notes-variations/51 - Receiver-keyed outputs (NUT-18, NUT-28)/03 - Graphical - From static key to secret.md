# 51.03 · From static key to secret

Variation 3 of slide 51 (Receiver-keyed outputs (NUT-18, NUT-28)) · lens: Graphical · deck `fcv-j-nutroot-use` page 5 · 6 steps · script 130 words, about 55 s

## Script

The payer computes e·P, the payee p·E.

**[1]** Both are the same point. Its x-coordinate, Zx, is the shared secret of this ECDH.

**[2]** SHA-256 over the tag Cashu_P2BK_v1, a shared x-coordinate and the one-byte slot index gives one scalar per slot. r₀ comes from Zx. The figure draws r₁ from the same Zx; in the specification each blinded key has its own ECDH, so the co-signer's r₁ comes from x(e·P₄).

**[3]** Slot 0: the payee key P plus r₀·G is the internal key K.

**[4]** Slot 1: the co-signer key P₄ plus r₁·G is P₄′, which replaces P₄ inside the after leaf.

**[5]** The leaf gives the root, the tweak t hashes K and the root, and K + t·G is the secret.

**[6]** The payee's key-path private key is p + r₀ + t.

## Background

- **ECDH**: e·P = e·p·G = p·E. Only the payer, who knows e, and the payee, who knows p, can compute it. Zx is its x-coordinate.
- **Per-key ECDH (NUT-28)**: the payer computes one shared x-coordinate per key it blinds: x(e·P) for the payee at slot 0, x(e·P₄) for the co-signer at slot 1. The payee cannot compute r₁ and cannot check P₄′; the co-signer checks it by value matching, with x(4·E) in the vectors.
- **Slot index in the hash**: rᵢ = SHA-256("Cashu_P2BK_v1" ‖ Zx ‖ i), so the same key at two positions gets unrelated blinded points.
- **P₄′ = P₄ + r₁·G**: the co-signer signs for it with 4 + r₁. With key 4 and ephemeral 5 it is 039ca579…24e6ca81, the NUT-28 vector.
- **Tweak t**: tagged_hash("Cashu_NutrootTweak", K ‖ root). With one leaf, the root is that leaf's hash.
- **p + r₀ + t**: the private key of K + t·G = (p + r₀)·G + t·G, taken mod n.

## Speaker note

- The figure feeds r₁ from the same Zx node as r₀, i.e. from the payee's ECDH. NUT-28 derives each key's scalar from its own ECDH secret ("For each receiver key P … Zx = x(eP)"; v3 section: "the same per-key ECDH secret"), and tests/28-tests.md computes slot1_blinded with x(e·P_4). For comparison (computed, not a spec value): slot 1 with the payee's Zx would give 035bb3d2…, not the vector's 039ca579…. The script says "r₁ from x(e·P₄)"; consider a second ECDH node for key 4 in the figure.
