# removed.02 · Witness rules for v3 inputs

Variation 2 of slide removed (Inputs sign, outputs never do) · lens: Advanced · deck `fcv-f-client-intent` page 30 · 3 steps · script 139 words, about 60 s

## Script

The v3 witness rules from NUT-10, NUT-04 and NUT-29.

**[1]** A proof input MUST carry a witness: a BIP-340 signature over its input digest. The key path is exactly one signature, checked x-only, made with k for a bare secret or k plus t mod n for a tweaked one; both look identical on the wire. The script path carries leaf, control block, signatures and, for hashlocks, a preimage, with at most 3 path hashes.

**[2]** A mint quote MUST carry a pubkey, and an unlocked quote cannot mint onto a v3 keyset. The witness sits in the request's signature field and commits the amount issued. In a NUT-29 batch every quote is locked and signs its own digest over one transcript.

**[3]** Around the rule: no sigflag, pre-v3 inputs unchanged, no witnesses in tokens, and a 4096-character bound mints may enforce.

## Background

- **Tweak t**: `t = tagged_hash("Cashu_NutrootTweak", K ‖ merkle_root)`. A secret with conditions is P = K + t·G, so its private key is p′ = (k + t) mod n, where n is the order of secp256k1.
- **Control block**: the internal key K and the merkle path from the revealed leaf to the root.
- **Thresholds**: a leaf needing n signatures counts distinct listed keys with a valid signature, and no more signatures than listed keys are allowed.
- **Signature field**: 128 hex characters for a key-path signature, or a serialized script-path JSON witness.
- **Quote lock as a nutroot point**: the lock key may itself commit conditions, for example an `after` refund leaf that makes an unredeemed quote reclaimable after a locktime.
- **4096 characters**: a MAY; every valid witness has a compact encoding below this bound.

## Speaker note

- Specified in cashubtc/nuts#443 (NUT-10, NUT-04, NUT-29, NUT-03, NUT-05); not implemented on the federation branches.
