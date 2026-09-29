# 51.04 · Request in, proof out: the NUT-18 vector

Variation 4 of slide 51 (Receiver-keyed outputs (NUT-18, NUT-28)) · lens: Explained via JSON · deck `fcv-j-nutroot-use` page 6 · 5 steps · script 137 words, about 60 s

## Script

The NUT-18 test vector's nutroot option.

**[1]** k is key 3, the payee's static key. l is the requested tree: one after leaf naming key 4. b lists key 4, which its owner tagged blind-me.

**[2]** The proof below was paid with ephemeral key 5. Slot 0 blinds k into the internal key K: key 3 plus r₀·G.

**[3]** Key 4 is in b, so at slot 1 the leaf carries key 4 plus r₁·G, 039ca579…, in its place. r₁ comes from the ECDH between the ephemeral and key 4.

**[4]** Every other leaf byte is copied unchanged: version and type, the n record, the keys record header, the time. A changed byte would change the secret.

**[5]** E is in the spend info because a blinding used it. The secret is K tweaked by the root of the transmitted tree, 0302fc15….

## Background

- **NUT-18 nutroot option**: `k`, the payee's static key; `l`, the requested leaves, serialized, in slot order; `b`, the keys their owners tag blind-me. The option's presence requests receiver-keyed outputs.
- **Blind-me tag**: the key owner's choice, relayed by the payee in `b`. It never appears in proof data.
- **TLV record**: type (1 byte), length (2 bytes, big-endian), value. The after leaf: 00 02 (version, type) | 02 0001 01 (n = 1) | 04 0021 plus a 33-byte key | 06 0004 68a3be80 (time 1755561600, 2025-08-19 00:00 UTC).
- **Why byte for byte**: the leaf bytes are the hash preimage. Any change changes the root and the secret, and the payee could not spend what arrives; a payer that cannot reproduce a leaf must refuse to pay.
- **Spend info E, K, tree**: E lets the payee derive K; K lets a third-party leaf signer such as key 4 build the control block; the tree holds the full leaves.
- **Secret**: K + t·G with t = tagged_hash("Cashu_NutrootTweak", K ‖ root); a single leaf's hash is the root.

## Speaker note

- The secret 0302fc15…572c566e is computed from K and the blinded leaf (the slide note says so); no vector file lists it. Recomputed: correct. K and the blinded leaf are the NUT-28 slot-map vector values, as tests/18-tests.md states.
