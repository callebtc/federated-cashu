# removed.04 · The proof container, byte by byte

Variation 4 of slide removed (v3 transaction transcript (NUT-10)) · lens: Explained via bytes · deck `fcv-f-client-intent` page 14 · 5 steps · script 120 words, about 50 s

## Script

The proof container from the swap vector: 145 bytes in rows of 16, with offsets on the left.

**[1]** Offset 0: type 01, a proof input, and length 008e, which is 142. 3 plus 142 is 145.

**[2]** Offset 3: field 01, the amount. Length 0001, value 08.

**[3]** Offset 7: field 02, the keyset ID. Length 0021 is 33 bytes, written raw because the ID is hex.

**[4]** Offset 0x2b: field 03, Y. Length 0030 is 48 bytes, a compressed G1 point. The secret, 02e6e7cf, is not in these bytes; Y is hash_to_curve_G1 of the secret.

**[5]** Offset 0x5e: field 04, C, the mint's signature, 48 bytes, ending at byte 145. These bytes open the transcript, and their SHA-256 is the input ID, 44002fef.

## Background

- **Offsets**: hexadecimal byte positions. 0x2b = 43, 0x5e = 94.
- **Field numbering in a proof container**: 01 amount, 02 keyset ID, 03 Y, 04 C; they must appear in strictly ascending order.
- **Keyset ID encoding**: raw bytes when the ID is hex (as here, 33 bytes); UTF-8 bytes for legacy non-hex IDs.
- **hash_to_curve_G1 (NUT-00)**: the v3 keyset's map from the secret's bytes to a point on BLS12-381's G1 group.
- **C**: the mint's BLS signature on the secret, also a G1 point.
- **input_id**: SHA-256 over the complete container record, header included, byte-identical to its appearance in the transcript.

## Speaker note

- Specified in cashubtc/nuts#443; not implemented on the federation branches.
