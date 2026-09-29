# 52.06 · Slot numbering in a two-leaf request

Variation 6 of slide 52 (Receiver-keyed outputs (NUT-18, NUT-28)) · lens: Focus: the slot map · deck `fcv-j-nutroot-use` page 8 · 5 steps · script 138 words, about 60 s

## Script

k is key 3; l holds a threshold leaf, 2 of keys 4 and 6, and an after leaf for key 4; b lists key 4; e is 5.

**[1]** Slot 0 is the internal key. Slots 1 onward follow the keys fields: leaves in transmitted order, keys in order within each leaf.

**[2]** Slot 0 is always blinded; that blinding is the receiver-keyed send.

**[3]** Key 4 is in b and appears twice. The slot index enters the hash, so slots 1 and 3 give two unrelated points.

**[4]** Key 6 is not in b: it stays verbatim, but still takes slot 2.

**[5]** Key 4's owner computes Zx = x(4·E) and a candidate P₄ + rᵢ·G for each slot 1 to 3. Candidates 1 and 3 are in the tree, candidate 2 is not. Matching is by value, never by position.

## Background

- **Slot map (NUT-28, v3)**: slot 0 is the internal key; slots 1 onward are the entries of the keys fields, walking the tree in transmitted order, keys in order within each leaf. Here slot 1 is key 4, slot 2 key 6, slot 3 key 4.
- **Verbatim keys still count**: every enumerated key takes a slot index, blinded or not, so all parties number the slots the same way.
- **Unrelated points**: rᵢ hashes the slot index, so key 4 at slots 1 and 3 becomes 039ca579… and 023d8b4c…. Without Zx nobody can link the two.
- **Per-key ECDH**: key 4's owner computes x(4·E); the payer computed the same value as x(5·P₄). The payee's own Zx plays no part here.
- **Value matching**: the fold sorts leaf hashes, so the transmitted order is not committed. The owner derives cᵢ for every slot 1 … N and looks for each in the tree.
- **256-slot cap**: one index byte, so slot 0 plus at most 255 leaf keys; both sides refuse a longer tree.

## Speaker note

- Slot 3 (023d8b4c…954c7511) and candidate c₂ (0288e9e9…67a497b9) are computed with the NUT-28 derivation, not spec vectors (the deck note says so). Recomputed: both correct. Slots 0 and 1 are vector values.
