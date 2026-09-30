# removed.04 · The two witnesses, byte by byte

Variation 4 of slide removed (Key path and script path) · lens: Explained via bytes · deck `fcv-i-nutroot-spend` page 6 · 4 steps · script 121 words, about 50 s

## Script

**[1]** Carol's key-path witness from the NUT-10 worked example: one JSON field, signatures, holding one 64-byte BIP-340 signature by p′, written as 128 hex characters. 147 characters in total.

**[2]** Alice's script-path witness is 350 characters. The leaf field holds the leaf's exact TLV bytes. Version 00, type 02 for after, then fields in ascending type order. Field 02, length 1: n = 1. Field 04, length 0x21, 33 bytes: key 4. Field 06, length 4: 68a3be80, the time 1755561600.

**[3]** control holds K, 33 bytes, 03a3e12c…, and an empty path, because the tree has one leaf. Then signatures: one 64-byte signature by key 4, 0b2ea247….

**[4]** Both are compact JSON strings, 147 and 350 characters, far below the 4096-character bound a mint may enforce.

## Background

- **TLV**: type, length, value. Each field is a 1-byte type, a 2-byte big-endian length, then the value. `04 0021` means field 4, 33 bytes.
- **Minimal integers**: 1755561600 = 0x68a3be80, four bytes, no leading zero byte. A leading zero byte is non-canonical and rejected.
- **Ascending field order**: fields strictly ascend by type (02, 04, 06), so a leaf has exactly one encoding. The leaf bytes are also the hash preimage.
- **Leaf size**: this after leaf is 49 bytes, 98 hex characters.
- **Signature encoding**: a BIP-340 signature is 64 bytes, 128 hex characters in JSON.
- **4096 characters**: an optional mint limit on the serialized witness.

## Speaker note

- The vector signatures sign an illustrative digest, SHA256("illustrative transaction transcript"), not a real input digest.
- 147 and 350 are the lengths of the vector witnesses in compact JSON (no whitespace), counted for the slide; they are not stated in the spec. I recomputed both.
