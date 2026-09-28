# 34.07 · One input, three transactions

Variation 7 of slide 34 (Per-input signing digest) · lens: Framing: what a witness authorizes · deck `fcv-f-client-intent` page 26 · 4 steps · script 113 words, about 50 s

## Script

One proof, the 8-sat proof of the swap vector, appears in three NUT-10 vectors.

**[1]** Its container never changes, so its input ID, 44002fef, is the same in all three.

**[2]** The transactions differ: a swap, a melt, and a melt with change. Their transaction digests differ, 7d478315, 1245d154 and 9443ab45, and so do the input digests, 867091ad, 269af868 and 1604341e.

**[3]** The swap's witness, a46a08f9, verifies in the swap. Over the melt and melt-with-change input digests it fails.

**[4]** A witness therefore authorizes one input in one transaction and nothing else. NUT-10 draws the consequence for tokens: v3 proofs in serialized tokens MUST NOT carry a witness, and wallets MUST drop one when encoding or decoding.

## Background

- **Witness scope**: the signed message is the input digest, which commits to the whole transaction, so a witness has no use outside it.
- **Serialized token**: the `cashuB` string a wallet sends to another wallet; it carries proofs and optional spend info, never a v3 witness.
- **Why drop instead of ignore**: a stale witness authorizes nothing, and carrying it would only expose the earlier transaction's signature.
- **Values**: the swap, melt and melt-with-change vectors of NUT-10.

## Speaker note

- The "fails" cells were recomputed with a BIP-340 verifier; the spec states that neither witness verifies in the other transaction. Specified in cashubtc/nuts#443; not implemented on the federation branches.
