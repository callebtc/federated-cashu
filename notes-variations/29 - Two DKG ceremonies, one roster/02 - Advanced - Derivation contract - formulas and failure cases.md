# 29.02 · Derivation contract: formulas and failure cases

Variation 2 of slide 29 (Two DKG ceremonies, one roster) · lens: Advanced · deck `fcv-e-membership-custody` page 28 · 4 steps · script 139 words, about 60 s

## Script

Derivation version 1, from root P to output key Q.

**[1]** The application tweak a is a tagged hash of root epoch, transcript, P and the application registration, mod the curve order, never zero. The chain code is a second tagged hash ending in P plus aG. The child adds a and public BIP32 tweaks b₀ and b_j, to P and to each share. Q is its BIP341 key-path tweak.

**[2]** BDK sees a depth-0 xpub and two tr descriptors; tests check equal addresses. Indexes are non-hardened only. An invalid child moves to the next index, accepted by consensus; the last index fails closed.

**[3]** Commitments and shares bind the full derivation, so swapping branch, index, network, tweaks or Taproot mode between rounds is rejected.

**[4]** Public tweaks separate namespaces, not compromise. frost-secp256k1-tr was outside the upstream NCC audit; mainnet waits on review.

## Background

- **Tagged hash**: SHA-256 over a fixed label followed by the inputs. H₁ uses `cdk/frost/application-derivation/v1`, H₂ uses `cdk/frost/bip32-chain-code/v1`. The label keeps each hash separate from all other uses.
- **mod n**: n is the order of the secp256k1 group, about 2²⁵⁶. A tweak must be a nonzero number below n.
- **Chain code**: 32 bytes that BIP32 combines with a public key to derive child keys. Here it is derived publicly from the application and the key P + a·G.
- **Depth-0 xpub**: an extended public key (public key plus chain code) presented to BDK as a root, although P + a·G is itself derived.
- **BIP32 invalid child**: BIP32 derives a tweak IL from a hash. If IL, read as a 256-bit number, is at least n, or the child point is the point at infinity, the index is invalid. The probability is below 2⁻¹²⁷ per index.
- **lift_x and hash_TapTweak**: lift_x returns the point with the given x-coordinate and even y (BIP340). hash_TapTweak is the BIP341 tagged hash of the internal key; with no script tree the output key is Q = lift_x(Pⱼ) + hash_TapTweak(x(Pⱼ))·G.
- **Namespace separation vs. compromise isolation**: the tweaks are public, so anyone who learns one complete derived private key can subtract the tweaks and obtain the root key. Tweaks keep applications' keys distinct; they do not protect one application from another's leak.
- **NCC audit**: NCC Group audited the upstream FROST crates at version 0.6.0; the audit statement excludes `frost-secp256k1-tr`, the Taproot ciphersuite CDK uses.

## Speaker note

- The "Residual risk" box is backed by `bls-federation:docs/federated-cashu-frost-crypto-review.md` (NCC audit scope) and `docs/federated-cashu-frost-bip32-derivation.md` (namespace separation, not compromise isolation). The test indexes (0, 1, 17, 1 000 003, 2³¹ − 1, 256 property indexes) match `crates/cdk-frost-bip32/src/lib.rs`.
