# 36.06 · Tree shape sets the script path cost

Variation 6 of slide 36 (Three tags, one output key) · lens: Framing: tree shape and proof size · deck `fcv-g-json-taproot` page 24 · 5 steps · script 138 words, about 60 s

## Script

Tree shape sets the script path control block size: 33 bytes plus 32 per level.

**[1]** Four leaves with spend probabilities: A 0.6, B 0.2, C and D 0.1 each.

**[2]** In a balanced tree every leaf is at depth 2: every control block is 33 + 64 = 97 bytes.

**[3]** Huffman repeatedly merges the two least likely nodes: C and D into 0.2, that with B into 0.4, then with A. A ends at depth 1 with 65 bytes, B at depth 2 with 97, C and D at depth 3 with 129.

**[4]** The expected depth is 1.6, so the expected control block is 33 + 32 × 1.6 = 84.2 bytes, against 97 balanced. The rare leaves pay 129.

**[5]** The revealed depth hints at the tree shape. BIP341 notes that deviating from the optimal tree can improve privacy.

## Background

- **Control block**: the script-path witness element with the leaf version, parity, internal key, and one 32-byte sibling hash per level.
- **Huffman algorithm**: builds a binary tree of minimum expected depth by merging the two least probable nodes until one remains. Likely leaves end near the root.
- **Expected depth**: E[m] = 0.6·1 + 0.2·2 + 0.1·3 + 0.1·3 = 1.6.
- **Depth leak (BIP341 security section)**: a spent leaf's depth reveals the minimum depth of the tree, which can suggest the wallet software and help clustering.
- **Cost**: witness bytes count toward transaction weight, so a shorter control block lowers the fee of the likely spend.
