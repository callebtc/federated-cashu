# removed.07 · SIG_ALL signs a concatenated string

Variation 7 of slide removed (Conditions as tags - HTLC (NUT-14)) · lens: Focus: the SIG_ALL message · deck `fcv-g-json-taproot` page 17 · 4 steps · script 139 words, about 60 s

## Script

Under SIG_ALL, one signature covers the whole transaction. This is the NUT-11 swap test vector: one input, one output.

**[1]** The message is the input's secret, 192 characters, its C as 66 hex characters, the output amount as the decimal string 2, and the output's B_ as 66 hex characters: 325 characters. Its SHA-256 is de7f9e3c…; the spec's signature verifies over it.

**[2]** The melt vector: the same pattern with a blank output of amount 0, then the 40-character quote id. 365 characters, digest 9efa1067….

**[3]** In general: every input's secret and C, then every output's amount and B_; for a melt, the quote id last. It is hashed and signed once. Only the first input carries the witness.

**[4]** If one input is SIG_ALL, every input must have the same kind, SIG_ALL, and the same data and tags. Otherwise the request fails.

## Background

- **C and B_**: C is an input's unblinded mint signature; B_ is an output's blinded message. Both enter the message as hex strings.
- **Blank output (NUT-08)**: an output with placeholder amount 0 that the mint may fill with change for overpaid Lightning fees.
- **Quote id**: the identifier of the melt quote being paid. Appending it binds the signature to that payment.
- **String concatenation**: the parts are joined without separators or length prefixes.
- **v3 keysets**: SIG_ALL and `sigflag` do not exist there; NUT-10 specifies a per-input digest over a TLV transaction transcript instead (specified in nuts#443, not yet implemented in the federation branches).

## Speaker note

- Lengths and digests are from the NUT-11 test vectors. Checked: 192, 325 and 365 characters and both digests match, and the vector signatures verify under BIP340 over these digests.
