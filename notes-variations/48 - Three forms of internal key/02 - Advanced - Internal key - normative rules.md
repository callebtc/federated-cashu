# 48.02 · Internal key: normative rules

Variation 2 of slide 48 (Three forms of internal key) · lens: Advanced · deck `fcv-i-nutroot-spend` page 20 · 3 steps · script 139 words, about 60 s

## Script

**[1]** Single-party key: without conditions the secret is K, untweaked. Sources: NUT-13 type 0x00, a NUT-28 blinded static key at slot 0, or a random keypair whose k travels in spend info. v3 derivations must be hardened at every step. A key derived from a received E must not be re-gifted as bearer k.

**[2]** Aggregated key: it must carry at least the empty tweak, the tweak hash over K alone, even when scriptless. Without a tree, receive checks that K or its empty tweak equals the secret. A non-cosigning wallet must not treat the proof as received value. Reason: BIP341's hidden script path.

**[3]** NUMS key: H must be lift_x of SHA-256 over G's 65-byte uncompressed encoding. u must be fresh per proof, disclosed in spend info, and absent otherwise. Seeded wallets may derive u. A NUMS key is never ECDH-blinded.

## Background

- **Hardened derivation (BIP32)**: a child key derived with the parent private key. With non-hardened derivation, one child private key plus the parent's xpub reveals the parent private key and every sibling. v3 keys travel to other people, so this matters.
- **Re-gift ban**: a key derived from E equals the receiver's static private key plus the blinding scalar r₀ (up to sign). The original sender knows r₀ and could recover the static key from it.
- **Hidden script path (BIP341)**: a cosigner of a plain-sum aggregate can shift its own key by the tweak of a tree only it satisfies. The empty tweak lets everyone check that the secret commits to K with no root.
- **lift_x**: the point with a given x-coordinate and even y.
- **ECDH blinding (NUT-28)**: the receiver derives its key through Diffie–Hellman with its private key. Nobody holds H's scalar, so a NUMS key cannot be blinded that way.
- **NUT-13 type 0x02**: derives u from the proof's counter with HMAC-SHA256, tying it to the proof's allocation.

## Speaker note

- The slide's "A derived key MUST NOT be re-gifted as a bearer k" refers to a key derived from E (NUT-10 Spend info, NUT-28), not to NUT-13 seed keys: the V4 bearer vector itself sends the NUT-13 counter-0 key as k. The script says "derived from a received E".
- Uniqueness note on the slide: one K under different trees gives distinct secrets; a repeated (K, tree) repeats the secret, and script paths revealing a shared K link proofs (NUT-10 Key uniqueness).
