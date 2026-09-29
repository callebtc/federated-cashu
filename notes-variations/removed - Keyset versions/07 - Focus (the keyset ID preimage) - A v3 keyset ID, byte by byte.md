# removed.07 · A v3 keyset ID, byte by byte

Variation 7 of slide removed (Keyset versions) · lens: Focus: the keyset ID preimage · deck `fcv-a-bls` page 41 · 5 steps · script 135 words, about 60 s

## Script

The NUT-02 v3 test vector, amounts 1 and 2.

**[1]** The preimage starts with len32 of the keys field: 000000d2, 210 bytes.

**[2]** Each amount is framed: length 1 and the byte 01, then length 96 and the 96-byte G₂ key. The same for amount 2. Two entries of 105 bytes each.

**[3]** Then the unit: length 3 and the bytes of "sat". Then the fee: length 0 and no bytes, because a zero fee is the empty byte string.

**[4]** 225 bytes in total. One SHA-256 gives 32 bytes starting b7e077d0. With the version byte 02 in front, that is the 33-byte keyset ID.

**[5]** For comparison, v2 hashes an ASCII string of amount:pubkey pairs and the unit, optionally the fee and final expiry, with prefix 01. v3 frames every field with a 4-byte length and leaves expiry out.

## Background

- **len32(x)**: the length of x in bytes as a 4-byte big-endian integer. 0x000000d2 = 210, 0x00000060 = 96.
- **Minimal big-endian amounts and fee**: the number in as few bytes as possible. 1 is 0x01, 256 is 0x0100, and 0 is the empty byte string.
- **Entry size**: 4 + 1 + 4 + 96 = 105 bytes per amount; two amounts give 210. Total preimage: 4 + 210 + 4 + 3 + 4 + 0 = 225 bytes.
- **Why length framing**: without lengths, bytes could shift between adjacent fields and two different keysets could produce the same preimage. With a length before every field the split is unique.
- **Expiry not committed**: NUT-02 vector 2 lists a final expiry, and its ID is the same as without it.
- **v2 preimage**: e.g. `1:02abc…,2:03def…|unit:sat|input_fee_ppk:100|final_expiry:…`, hashed with SHA-256 and prefixed 01.

## Speaker note

- 210, 105 and 225 bytes are computed, not stated in the spec. I recomputed the preimage from the vector's keys; its SHA-256 gives exactly the vector ID `02b7e077…cf99f6`.
