# 43.03 · Five leaves to scale

Variation 3 of slide 43 (Condition leaves) · lens: Graphical · deck `fcv-h-nutroot-tree` page 21 · 5 steps · script 125 words, about 55 s

## Script

The five leaf shapes from the vectors, drawn to scale, one colored block per field.

**[1]** threshold, 42 bytes: two header bytes for version and type, four bytes for the n record, and 36 bytes for the keys record with one key.

**[2]** threshold with disclosure, 46 bytes: the same leaf plus the four-byte record 0a000101.

**[3]** after, 49 bytes: the threshold fields plus a seven-byte time record, a three-byte header and a four-byte time.

**[4]** hashlock, 77 bytes, the largest: the threshold fields plus a 35-byte hash record, a 32-byte SHA-256 digest behind its header.

**[5]** commit, 37 bytes: version, type and one hash record. No n and no keys.

In every spendable leaf the keys record is the largest part: 33 bytes per key plus a three-byte header.

## Background

- **Record overhead**: every field costs 3 bytes of type and length before its value.
- **Sizes**: n record 1 + 2 + 1 = 4; keys record 3 + 33·m; time record 3 + 4 for a 4-byte time; hash record 3 + 32; disclosure record 3 + 1.
- **Body limit**: the bytes after the version byte must not exceed 512, which caps a threshold leaf at 15 keys.
- **Colors**: version and type, n, keys, time, hash and disclosure each have one color in the legend.
- **Commit leaf**: carries only `hash`; it never names keys because it is never a spend path.
