# removed.08 · Where 8, 3, 512 and 120 come from

Variation 8 of slide removed (The fold fixes the shape) · lens: Framing: the constraint behind the limits · deck `fcv-h-nutroot-tree` page 35 · 5 steps · script 137 words, about 60 s

## Script

**[1]** NUT-28 blinds each key with a one-byte slot index, so a secret has 256 slots. Slot 0 is the internal key, which leaves at most 255 leaf keys. A 256th leaf key would reuse slot 0's index.

**[2]** A leaf body is at most 512 bytes. A threshold body is one type byte, four bytes for n, a three-byte keys header and 33 bytes per key: 15 keys give 503 bytes, 16 give 536. So a leaf holds at most 15 keys.

**[3]** A tree holds at most 8 leaves. Eight times 15 is 120 leaf keys, within the 255 slots.

**[4]** With 8 leaves and the fixed fold, every path has at most 3 sibling hashes. Nine or more leaves are rejected outright.

**[5]** Any future increase to either cap must stay within 255 slots, or revise NUT-28's slot encoding.

## Background

- **NUT-28 slot index**: each blinded key uses a blinding scalar derived from the shared ECDH secret and a one-byte index i. One byte has 256 values, 0 to 255.
- **Why a 256th leaf key collides**: its index would wrap to 0, the internal key's index, and reuse that tweak. Both sides must refuse such a tree rather than truncate it.
- **Leaf body**: the bytes after the version byte: type (1), n record (4), keys record (3 + 33·m), plus any other records.
- **Arithmetic**: 1 + 4 + 3 + 33·15 = 503; 1 + 4 + 3 + 33·16 = 536 > 512.
- **Path bound**: under the fold, 8 leaves need 3 levels, so every path has at most 3 sibling hashes; verifiers reject longer paths first.

## Speaker note

- 15 keys per leaf is the maximum for threshold (503 B body) and after (510 B) leaves. A hashlock leaf carries a 35-byte hash record and fits at most 14 keys (505 B). 120 is therefore an upper bound, as the spec's note states it.
