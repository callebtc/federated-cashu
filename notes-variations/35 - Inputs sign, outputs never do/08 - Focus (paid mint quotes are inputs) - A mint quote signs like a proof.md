# 35.08 · A mint quote signs like a proof

Variation 8 of slide 35 (Inputs sign, outputs never do) · lens: Focus: paid mint quotes are inputs · deck `fcv-f-client-intent` page 36 · 4 steps · script 133 words, about 55 s

## Script

Paid mint quotes are transaction inputs and sign like proofs. The values are the partial-mint vector.

**[1]** The mint request names quote-mint-0004 and one 4-sat output. The quote's witness, 1b6de2bf, travels in the request's signature field.

**[2]** The quote was paid 8 sat, and this request issues 4. The quote container, type 02, commits the amount issued now, 4, and the quote ID as UTF-8 bytes.

**[3]** The transaction digest is e02e360b and the quote's input digest 7578e345. The quote's lock key, 02929055, signs that input digest, and the signature verifies.

**[4]** Over a transcript committing 8 instead of 4, the same signature fails. In a batched mint there is one transcript, and each quote's lock key signs its own input digest. The quote must carry a pubkey: an unlocked quote cannot mint onto a v3 keyset.

## Background

- **Mint quote**: the mint's payment request for minting; once paid, the quote can be redeemed for new proofs, possibly in several partial mints.
- **Partial mint**: issuing less than the paid amount; the rest stays mintable (at most `amount_paid − amount_issued`).
- **Lock key (`pubkey`, NUT-04)**: the public key attached to the quote. In v3 it is mandatory; its private key signs the quote input's digest.
- **Signature field**: carried the NUT-20 signature before v3; for v3 keysets it carries the quote input's witness instead.
- **Batched mint (NUT-29)**: several quotes in one request; `signatures[i]` is quote i's witness over its own input digest.

## Speaker note

- The failure over a transcript committing 8 was recomputed for this page (the spec states "The signature MUST NOT verify over the transcript that commits 8" but gives no digest for that case). Specified in cashubtc/nuts#443; not implemented on the federation branches.
