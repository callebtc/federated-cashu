# 33.01 · Writing a transaction as records

Variation 1 of slide 33 (v3 transaction transcript (NUT-10)) · lens: Beginner · deck `fcv-f-client-intent` page 11 · 5 steps · script 137 words, about 60 s

## Script

The transcript writes a transaction as records. Each record has three parts.

**[1]** One byte says what the record is: the type. Two bytes give the length of the value, most significant byte first. Then come the value bytes.

**[2]** Amounts use as few bytes as possible. 8 is one byte, 08. 256 needs two, 01 00. Zero uses no value bytes at all: length 0000.

**[3]** A proof input is a record of type 01 and length 142 holding four smaller records: amount, keyset ID, Y and C. Y is the proof's secret hashed to a curve point; the secret itself is not written. C is the mint's signature.

**[4]** The transcript lists every input record, then every output record: 145 plus 94 plus 94 bytes, 333 in total.

**[5]** One SHA-256 over those 333 bytes gives the transaction digest, 7d478315.

## Background

- **TLV (type, length, value)**: a binary record format. A reader knows each record's size from its length field, so records can be nested and parsed without separators.
- **Big-endian**: the most significant byte comes first. 256 = 0x0100 is written `01 00`.
- **Minimal encoding**: no leading zero bytes. Every number has exactly one encoding, so every party computes the same bytes and the same hash. A leading zero byte must be rejected.
- **Keyset ID**: identifies the mint key set that signed the proof; the v3 ID here is 33 bytes, written raw.
- **Y**: `hash_to_curve_G1(secret)`, a 48-byte point on the BLS12-381 curve. It identifies the proof in the mint's spent list without writing the secret.
- **Sizes**: input record 3 + 142 = 145 bytes; each output record 3 + 91 = 94 bytes; 145 + 94 + 94 = 333.
- **SHA-256**: a hash function that maps any byte string to 32 bytes; changing any input byte changes the output.

## Speaker note

- The transcript is specified in cashubtc/nuts#443 (NUT-10); neither federation branch implements it yet.
