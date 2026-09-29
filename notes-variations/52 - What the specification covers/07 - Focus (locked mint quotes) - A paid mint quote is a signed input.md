# 52.07 · A paid mint quote is a signed input

Variation 7 of slide 52 (What the specification covers) · lens: Focus: locked mint quotes · deck `fcv-j-nutroot-use` page 17 · 5 steps · script 133 words, about 55 s

## Script

**[1]** The wallet requests a bolt11 mint quote with a lock key L in the pubkey field. On a v3 keyset the lock is mandatory: an unlocked quote has no key to sign with. The mint returns the quote id and a payment request.

**[2]** The request is paid; the quote has 8 to issue.

**[3]** In the transcript the paid quote is an input. Container 0x02 commits the quote id, quote-mint-0001, and the amount this request issues, 8. The output follows in container 0x03: amount, keyset id and B_.

**[4]** The mint request carries the quote, the outputs and a signature by L over the quote input's digest, ca6970e6…. The mint returns blind signatures.

**[5]** L may itself be a nutroot point. An after leaf lets a never-redeemed quote be reclaimed by script path after the locktime.

## Background

- **Mint quote (NUT-04)**: the mint's offer to issue ecash once its payment request is paid (for bolt11, a Lightning invoice); the quote id identifies it.
- **Quote lock**: NUT-20 made it optional before v3. On v3 it is mandatory, because the paid quote is a transaction input and inputs sign.
- **Input digest**: tagged_hash("Cashu_TransactionInput", SHA-256(transcript) ‖ SHA-256(quote container)). Signing it binds the quote and all outputs.
- **Amount issued**: the quote container commits the amount this request issues, not the quote amount; it must not exceed amount_paid minus amount_issued. A partial mint of 4 against an 8-sat quote commits 4.
- **B_**: the blinded message; 48 bytes on a BLS12-381 v3 keyset.
- **Batched mint (NUT-29)**: each quote in the batch signs its own input digest over one shared transcript.
- **Signature field**: a 128-hex BIP-340 signature for a key-path lock, or a serialized script-path witness.

## Speaker note

- The tests/10-tests.md mint vector (quote-mint-0001) gives transcript, digest and input digest but no lock key or signature; "signed by L" on the slide is the rule, not a vector signature. The partial and batched mint vectors do include lock keys and signatures.
