# 41.05 · What a chain observer learns

Variation 5 of slide 41 (Key path and script path (BIP341, BIP342)) · lens: Perspective: chain observer · deck `fcv-g-json-taproot` page 31 · 4 steps · script 137 words, about 60 s

## Script

What a chain observer learns from each spend type.

**[1]** Before the spend both outputs look the same: OP_1 and 32 bytes, like any taproot output. The witness differs: one 64- or 65-byte signature, or inputs, script and control block.

**[2]** The key path reveals no conditions and hides the internal key. The script path reveals only the executed script, and the 32-byte internal key.

**[3]** Other scripts stay hidden; the script path shows only sibling hashes. Its path length m shows the tree has at least m levels.

**[4]** A key path spend looks like a single-key spend. A script path spend shows that a script path exists and the key path was not used. BIP341: leaf depth can point to the wallet software. Keys should be fresh per output and distinct per leaf, so unrevealed leaves cannot be brute-forced.

## Background

- **65-byte signature**: a 64-byte signature plus an explicit sighash type byte.
- **Minimum depth**: a leaf at depth m proves the tree has at least m levels; the full shape stays hidden.
- **Wallet fingerprinting and clustering**: typical tree shapes differ between wallet implementations, so depth can link outputs to software and to each other.
- **Key reuse**: identical leaves in two outputs produce identical Merkle branches, which links the outputs.
- **Brute force of leaves**: if a leaf used a known key and a standard script template, an observer could hash candidate scripts and compare them with a revealed sibling hash. Distinct fresh keys per leaf prevent this.
