# 33 · v3 transaction transcript (NUT-10)

1.6 Client intent · 4 steps · script 130 words, about 55 s

## Script

The v3 answer is a canonical serialization of the whole transaction, specified in NUT-10. The example is from the test vectors: a swap with one 8-sat proof in and two 4-sat blinded messages out.

**[1]** Each proof input becomes a container of type 0x01: amount, keyset ID, Y and C. Y is the hashed secret; the secret itself never enters the transcript.

**[2]** Each blinded message becomes a container of type 0x03: amount, keyset ID and B_.

**[3]** Every record is one type byte, a two-byte big-endian length, then the value. Containers are grouped by ascending type; elements keep request order.

**[4]** The transaction digest is a plain SHA-256 over the 333-byte transcript.

The other container types are 0x02 mint quote, 0x04 melt quote, and 0x05 authorized request, for NUT-22. Integers are minimal big-endian.

## Background

- **Canonical serialization**: exactly one valid byte encoding per transaction, so every party computes the same digest.
- **TLV**: type–length–value, a binary record format: a type code, the length of the value, then the value.
- **Big-endian**: most significant byte first. **Minimal**: no leading zero bytes.
- **B_**: the blinded message (B′ on earlier slides), 48 bytes on BLS12-381.
- **Why Y and not the secret**: Y = hash_to_curve(secret) identifies the proof without revealing the secret.
- **Sizes**: input record 1 + 2 + 142 = 145 bytes; each output record 1 + 2 + 91 = 94 bytes; 145 + 2·94 = 333.

## Status

- Specified in `cashubtc/nuts#443`. Neither federation branch implements v3 transcript signing yet.
