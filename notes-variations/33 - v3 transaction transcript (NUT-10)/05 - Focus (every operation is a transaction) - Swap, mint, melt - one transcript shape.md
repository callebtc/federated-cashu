# 33.05 · Swap, mint, melt: one transcript shape

Variation 5 of slide 33 (v3 transaction transcript (NUT-10)) · lens: Focus: every operation is a transaction · deck `fcv-f-client-intent` page 15 · 5 steps · script 129 words, about 55 s

## Script

Every v3 operation has one transaction shape with four container types. 01 is a proof input, 02 a mint quote input, 03 a blinded message output, 04 a melt quote output. Inputs sign; outputs never do.

**[1]** Swap: one proof in, two blinded messages out, 333 bytes.

**[2]** Mint: the paid quote is the input, 25 bytes, and one 8-sat blinded message is the output. 119 bytes.

**[3]** Batched mint, NUT-29: two quote inputs committing 5 and 3, one 8-sat output, 144 bytes.

**[4]** Melt: the proof is the input, the melt quote the output, 170 bytes.

**[5]** Melt with change adds two NUT-08 blank outputs of 93 bytes each, 356 bytes in total.

Each digest comes from the NUT-10 vectors. Other combinations are valid transactions and need only an endpoint or request field.

## Background

- **Mint (NUT-04)**: turn a paid quote into new proofs. In v3 the quote is an input that signs with its lock key.
- **Batched mint (NUT-29)**: several quotes minted in one request; each quote is its own input.
- **Melt (NUT-05)**: spend proofs to have the mint make an external payment; the melt quote is the output that receives the value.
- **Blank outputs (NUT-08)**: amount-0 blinded messages that carry returned fee change. Their amount encodes as an empty value, so each is 93 bytes rather than 94.
- **Container sizes**: quote containers are 3 + 22 = 25 bytes with the 15-byte quote IDs of the vectors.
- **transaction_digest**: SHA-256 of each transcript; every transaction has a different one.

## Speaker note

- Sizes and digests match the NUT-10 vectors (rechecked). Specified in cashubtc/nuts#443; not implemented on the federation branches.
