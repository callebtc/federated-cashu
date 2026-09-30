# removed.02 · Spend info: presence rules and precedence

Variation 2 of slide removed (Spend info and receive-time checks) · lens: Advanced · deck `fcv-i-nutroot-spend` page 28 · 4 steps · script 140 words, about 60 s

## Script

**[1]** k must not appear with E. A key derived from E must not be re-gifted as k: sweep, then send, because the first sender knows the blinding tweak and could recover the receiver's static key. E should be sent when the sender holds the receiver's static key; k is the offline fallback.

**[2]** K must accompany a tree when neither k nor E does, for the control block. It should accompany E, since third-party leaf signers cannot derive it. tree: full leaves in slot order, never hashes. A permuted list is equivalent.

**[3]** u must be present exactly when K is a NUMS offset. Omission is undetectable, but fails a NUT-18 NUMS request.

**[4]** Check 1 takes the key from bearer k·G, then from E at slot 0, then a disclosed K. A disclosed K that differs from the E-derived key must reject.

## Background

- **Re-gift attack**: a key derived from E is the receiver's static private key plus the slot-0 blinding scalar r₀ (up to sign). The first sender knows r₀, so seeing that key reveals the static key.
- **Offline fallback**: a sender that has no static key for the receiver hands over a bearer k.
- **Slot order**: the order in which NUT-28 assigns blinding slots to leaf keys. The root sorts leaf hashes, so the order is not committed and nothing may be derived from it.
- **NUT-18 NUMS request**: a payment request may name H as its key to ask for script-only proofs; the payee verifies K − u·G = H, which needs u.
- **Precedence**: the order in which check 1 takes the internal key when several sources are present. The E-derived key is authoritative.
- **V4 tokens**: CBOR-encoded tokens (cashuB). Spend info is the map `si` with byte-string values under short keys: k, e (for E), i (for K), t (for tree), u. Tokens never carry v3 witnesses.
