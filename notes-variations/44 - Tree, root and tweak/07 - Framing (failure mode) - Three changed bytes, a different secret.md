# 44.07 · Three changed bytes, a different secret

Variation 7 of slide 44 (Tree, root and tweak) · lens: Framing: failure mode · deck `fcv-h-nutroot-tree` page 17 · 5 steps · script 131 words, about 55 s

## Script

The three-leaf vector next to a copy with one field changed. The internal key is the same.

**[1]** The after leaf's time moves by one month, from 2025-08-19 to 2025-09-19. Three of its 49 bytes change: 68a3be80 becomes 68cc9d00.

**[2]** Its leaf hash changes completely, from 9ed9c0b8… to 7be5a164…, and it sorts between h₀ and h₂.

**[3]** The fold pairs different hashes: the branch of h₀ and h₁′, with h₂ promoted. The root becomes 54ba2366… instead of 3d4fbecf….

**[4]** Another root gives another tweak, d0d14c62…, and another secret, 02364898….

**[5]** A tree that does not reproduce the secret fails check 1 at the receiver. For a NUT-18 request, a payer that cannot reproduce a requested leaf byte for byte must refuse to pay: altered leaf bytes change the secret, and the payee cannot spend what arrives.

## Background

- **1758240000**: Unix seconds for 2025-09-19 00:00 UTC, hex 68cc9d00. The original 1755561600 is 68a3be80.
- **Hash sensitivity**: a SHA-256 output changes unpredictably when any input byte changes, so the new leaf hash has no relation to the old one.
- **Why the order changes**: the fold sorts leaf hashes, so a new hash can take a new position and pair with a different neighbour.
- **Check 1**: the receiver recomputes the root from the disclosed leaves and requires K + t·G to equal the secret.
- **NUT-18 exactness**: the payee's request lists the leaves; the payer must reproduce them byte for byte, and the payee checks the disclosed tree matches the request one-to-one.

## Speaker note

- Right-column values (`7be5a164…`, `54ba2366…`, `d0d14c62…`, `02364898…`) are computed, not vectors (the slide says so). Recomputed: they match. The left column's tweak `ea08208d…` is also derived, not printed in the vectors.
