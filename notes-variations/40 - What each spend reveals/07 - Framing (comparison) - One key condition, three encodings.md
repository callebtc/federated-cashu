# 40.07 · One key condition, three encodings

Variation 7 of slide 40 (What each spend reveals) · lens: Framing: comparison · deck `fcv-g-json-taproot` page 33 · 5 steps · script 139 words, about 60 s

## Script

**[1]** One condition, a valid signature by key A, in three encodings.

**[2]** As a NUT-11 JSON secret: the secret with A in data is 195 bytes of text, the witness with one signature 147. The mint sees A, the nonce and all tags. 342 bytes revealed.

**[3]** As a tapscript leaf: x(A) then OP_CHECKSIG, 34 bytes. The witness is a 64-byte signature, the script, and a 33-byte control block for a one-leaf tree: 131 bytes. The chain sees A, the internal key, and that a script path exists.

**[4]** As the key path: A is the internal key with no scripts, tweaked by the TapTweak hash of x(A). The witness is one 64-byte signature, and the chain sees a single-key spend.

**[5]** Size and disclosure fall from left to right. Nutroot, on v3 keysets, brings key path and leaves into the Cashu secret.

## Background

- **147 bytes of witness text**: `{"signatures":["` (16) + 128 hex characters + `"]}` (3).
- **One-leaf control block**: 33 bytes: leaf version with parity, then x(P); no path hashes.
- **Key-path-only tweak**: Q = A + hash_TapTweak(x(A))·G, the empty-tree commitment BIP341 recommends.
- **Nutroot (NUT-10, v3 keysets)**: the Cashu secret is a public key tweaked by a tree of condition leaves; a key-path spend reveals no conditions, a script-path spend reveals one leaf.

## Speaker note

- The counts mix units, as the slide note says: JSON text characters for the NUT-11 case, raw witness element bytes for taproot (without the compact-size length prefixes of the serialized witness).
