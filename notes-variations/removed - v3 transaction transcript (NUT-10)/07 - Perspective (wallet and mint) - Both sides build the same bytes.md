# removed.07 · Both sides build the same bytes

Variation 7 of slide removed (v3 transaction transcript (NUT-10)) · lens: Perspective: wallet and mint · deck `fcv-f-client-intent` page 17 · 4 steps · script 136 words, about 60 s

## Script

The transcript is never sent. Wallet and mint each build it from the request.

**[1]** The wallet holds the private key k, the secret K, which is k·G, and the signature C. It computes Y, the hash of K to a G1 point, and builds the 333-byte transcript, digest 7d478315.

**[2]** From that it derives the input digest, 867091ad, and signs it with k using BIP-340.

**[3]** The swap request carries the proof with its witness, and the outputs. It has no transcript field.

**[4]** The mint reads amount, keyset ID, K, C, the witness and the outputs. It computes Y and checks that Y is unspent, rebuilds the same 333 bytes and input digest, and verifies the signature against the x-coordinate of K. For a melt, it reads the quote amount and fee reserve from its own quote state.

## Background

- **Why no transcript field**: the encoding is canonical, so the transcript is a function of the request. Both sides compute it; there is no transmitted copy that could disagree with the request.
- **x-only verification (BIP-340)**: BIP-340 public keys are 32-byte x-coordinates. The verifier drops the prefix byte (02 or 03) of the 33-byte compressed secret and verifies against x.
- **Y and spent state**: the mint records spent proofs by Y. A second spend of the same Y is refused.
- **Melt quote state**: the melt quote container binds values the mint already stores, so the wallet cannot choose a different amount or fee reserve.
- **POST /v1/swap (NUT-03)**: the existing swap endpoint; v3 adds no new endpoint.

## Speaker note

- Specified in cashubtc/nuts#443; not implemented on the federation branches. The keys and values are the NUT-10 swap vector.
