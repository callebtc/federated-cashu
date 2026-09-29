# 37.06 · Re-serializing the secret breaks the proof

Variation 6 of slide 37 (NUT-10 well-known secrets) · lens: Framing: failure mode · deck `fcv-g-json-taproot` page 8 · 4 steps · script 140 words, about 60 s

## Script

The secret as issued: 195 bytes, no whitespace.

**[1]** The mint signed Y of exactly these bytes. Their SHA-256 is 6eebbc3a…, Y is 02561ea0…, and the proof is valid.

**[2]** A wallet parses the JSON and serializes it again with a library that adds a space after each comma and colon. The JSON value is unchanged. The string has 7 more bytes: 202.

**[3]** New bytes give a new Y′ and a new SHA-256. C was computed for the old Y, so C ≠ k·Y′, and the proof fails before any spending condition is checked.

**[4]** Third case: the wallet keeps the secret bytes, so Y is unchanged, but signs the escaped transport text, 211 characters with backslashes. The digest differs and the signature fails. NUT-11 requires the message to be the unescaped secret string. Wallets must store the secret bytes exactly as issued.

## Background

- **JSON value and JSON text**: many texts parse to the same value (whitespace, key order, escapes). Hashes and signatures are computed over the text's bytes, not over the value.
- **No canonical form**: NUT-10 defines no canonical serialization for the secret. The issued string is the only valid form.
- **Escaped transport form**: inside the proof JSON each `"` of the secret is written `\"`. Parsing the proof JSON yields the unescaped string, which is the message.
- **C ≠ k·Y′**: the mint's signature is bound to Y, and Y is bound to the exact bytes through hash_to_curve.

## Speaker note

- The hashes and Y values in the table were computed for the slide from the NUT-11 example; they are not spec test vectors. Recomputed here: 202 and 211 bytes, and all four hashes, match.
