# 44.01 · Reading a leaf, byte by byte

Variation 1 of slide 44 (Condition leaves) · lens: Beginner · deck `fcv-h-nutroot-tree` page 19 · 5 steps · script 138 words, about 60 s

## Script

The simplest leaf in the vectors, threshold_1of1_key3, 42 bytes.

**[1]** The first byte is the leaf version, 00. It is the only version defined; any other version makes a leaf unsatisfiable.

**[2]** The second byte is the leaf type. 01 is threshold: n of the listed keys must sign.

**[3]** Then records. Each record is a type byte, a two-byte big-endian length, and the value. 02 0001 01 is field 0x02, n, one byte long, value 1.

**[4]** 04 0021 is field 0x04, keys, with length hex 21, which is 33 bytes: one compressed point, key 3. All keys go into this one record.

**[5]** One plus one plus four plus 36 is 42 bytes. The leaf means: one signature by key 3. There are no names and no separators; these exact bytes are hashed, sent and checked. The leaf hash is 23e8ff16….

## Background

- **TLV record**: type (1 byte) ‖ length (2 bytes, big-endian) ‖ value. A parser can read the fields without any field names or delimiters.
- **Big-endian**: the most significant byte comes first; `0021` is 33.
- **Hex notation**: 0x21 is hexadecimal 21, decimal 33.
- **Compressed point**: prefix byte 02 or 03 plus the 32-byte x-coordinate. Key 3 is `02f9308a…bce036f9`.
- **Unsatisfiable**: no witness can spend through the leaf; the path is disabled.
- **Leaf hash**: tagged_hash("Cashu_NutrootLeaf", the 42 bytes). `23e8ff16…839116cb` appears in the vectors as h₀ of the three-leaf tree.
