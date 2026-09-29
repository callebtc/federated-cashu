# removed.03 · 333 bytes

Variation 3 of slide removed (v3 transaction transcript (NUT-10)) · lens: Graphical · deck `fcv-f-client-intent` page 13 · 3 steps · script 118 words, about 50 s

## Script

The swap transcript drawn to scale, five pixels per byte.

**[1]** One proof input of 145 bytes, then two blinded messages of 94 bytes each. Inputs come first because their container type, 01, is lower than the outputs' 03.

**[2]** Inside each container, the narrow segments are the type and length header, 3 bytes, and the amount record, 4 bytes. The keyset ID record is 36 bytes. Y and C take 51 bytes each: a 3-byte field header and a 48-byte BLS12-381 point. The outputs carry B_, the blinded message, in the same 51 bytes. The secret does not appear; it enters only as Y, its hash to the curve.

**[3]** SHA-256 over all 333 bytes gives the transaction digest, 7d4783154ee7.

## Background

- **BLS12-381 G1 point**: an elliptic-curve point on the curve used by keyset v3; compressed, it is 48 bytes.
- **B_**: the blinded message, the wallet's blinded output that the mint signs.
- **hash-to-curve**: a function that maps bytes deterministically to a curve point with no known discrete logarithm. `Y = hash_to_curve_G1(secret)` identifies the proof without revealing the secret.
- **Field record sizes**: amount `01 0001 08` = 4 bytes; keyset ID `02 0021` + 33 = 36; Y and C `0x 0030` + 48 = 51 each. 3 + 4 + 36 + 51 + 51 = 145; 3 + 4 + 36 + 51 = 94.
- **Ordering**: containers group by ascending type, so proof inputs (01) precede blinded messages (03).

## Speaker note

- Specified in cashubtc/nuts#443; not implemented on the federation branches.
