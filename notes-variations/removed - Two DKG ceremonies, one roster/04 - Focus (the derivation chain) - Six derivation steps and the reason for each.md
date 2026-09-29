# removed.04 · Six derivation steps and the reason for each

Variation 4 of slide removed (Two DKG ceremonies, one roster) · lens: Focus: the derivation chain · deck `fcv-e-membership-custody` page 30 · 6 steps · script 135 words, about 60 s

## Script

Six steps take the FROST root to a Bitcoin output key, each with its reason and owner.

**[1]** The root P stays untweaked and application-neutral; the upstream post-DKG Taproot output is never stored as root. Owner: cdk-frost.

**[2]** An application tweak a separates applications on the same root: namespaces, not compromise isolation.

**[3]** BIP32 needs a chain code. It is derived publicly from the root epoch, the application and the group key. Owner: cdk-frost-bip32.

**[4]** Branch and index use non-hardened BIP32. BDK watches from an xpub, and members add the same public tweak to their shares. Hardened derivation hashes the parent private key, which no member has.

**[5]** BIP340 even-Y normalization happens only inside FROST signing, in frost-secp256k1-tr, and is never stored.

**[6]** The BIP341 TapTweak with no script root gives key-path-only outputs: branch 0 for receive, branch 1 for change.

## Background

- **Untweaked root**: the group public key exactly as the DKG produced it, with no application or Bitcoin tweak applied, so other applications can derive from it.
- **post_dkg**: a function in `frost-secp256k1-tr` that converts DKG output into Taproot-tweaked form. CDK does not use its output as the stored root.
- **Application tweak a**: a scalar from a tagged hash of the root and the application registration; each application gets a different key from the same root.
- **Chain code**: 32 bytes that BIP32 needs together with a public key to derive children.
- **Hardened vs. non-hardened BIP32**: a hardened child is derived from a hash that includes the parent private key; a non-hardened child only needs the parent public key and chain code. With a threshold key nobody holds the parent private key, so only non-hardened derivation works.
- **BIP340 even-Y**: BIP340 public keys are x-coordinates only; a key whose point has odd y is negated for signing. Here this happens transiently per signature.
- **BIP341 TapTweak**: the Taproot output key is the internal key plus hash_TapTweak(internal key)·G. With no script root, the output can only be spent with a key-path signature.
- **P2TR**: pay-to-Taproot, the output type that commits to the tweaked output key.
