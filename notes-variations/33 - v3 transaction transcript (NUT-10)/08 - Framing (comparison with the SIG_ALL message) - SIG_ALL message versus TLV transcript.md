# 33.08 · SIG_ALL message versus TLV transcript

Variation 8 of slide 33 (v3 transaction transcript (NUT-10)) · lens: Framing: comparison with the SIG_ALL message · deck `fcv-f-client-intent` page 18 · 3 steps · script 137 words, about 60 s

## Script

Left: the string a NUT-11 SIG_ALL witness signs for a swap, the inputs' secrets and C, then the outputs' amounts and B_. Right: the v3 transcript, one typed record per element.

**[1]** SIG_ALL joins strings; the transcript uses typed records with two-byte lengths. SIG_ALL names an input by its secret and C in hex; the transcript uses Y and C as raw bytes and never the secret. Input amounts and keyset IDs are only in the transcript.

**[2]** A melt quote is an appended ID in SIG_ALL, and a container with ID and amount plus fee reserve in v3. Mint quotes use a separate NUT-20 message; in v3 they are signing inputs.

**[3]** SIG_ALL is signed by the first input's witness, and only when the lock opts in. The transcript is signed by every v3 input, in every v3 transaction.

## Background

- **SIG_ALL (NUT-11)**: a P2PK flag; the signature covers all inputs and outputs of the transaction. The message is a string concatenation hashed with SHA-256.
- **Length prefixes**: each record states its own length, so the byte string parses one way only and every field is unambiguous.
- **Why input amounts and keyset IDs matter**: a signature that commits them fixes exactly which proofs, at which values and under which keys, the transaction spends.
- **NUT-20 message**: the pre-v3 mint quote signature over `Cashu_MintQuoteSig_v1`, the quote ID and the outputs' B_ bytes, sent in the mint request. In v3 it is replaced by the quote input's witness over its input digest.
- **Opt-in**: SIG_ALL is chosen when the proof is locked, as a tag in its secret; a proof without it has no output binding.

## Speaker note

- Specified in cashubtc/nuts#443; not implemented on the federation branches.
