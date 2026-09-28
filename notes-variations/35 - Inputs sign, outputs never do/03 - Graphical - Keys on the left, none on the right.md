# 35.03 · Keys on the left, none on the right

Variation 3 of slide 35 (Inputs sign, outputs never do) · lens: Graphical · deck `fcv-f-client-intent` page 31 · 4 steps · script 115 words, about 50 s

## Script

Two proofs on the left, three blinded messages on the right, one transcript in the middle.

**[1]** All five elements enter the transcript: the two proof containers first, then the three output containers.

**[2]** From the transcript each input gets its own digest, d1 and d2. Each is the tagged hash of the shared transaction digest and that input's ID.

**[3]** Each proof's key signs its own digest: k1 produces sigma 1 over d1, k2 produces sigma 2 over d2. k1 and k2 are the private keys of the two proofs' secrets.

**[4]** The outputs, B1 to B3, have no key and sign nothing. They are covered because d1 and d2 both commit to the whole transcript, outputs included.

## Background

- **d1, d2**: input digests, `tagged_hash("Cashu_TransactionInput", transaction_digest ‖ input_id)`.
- **σ1, σ2**: BIP-340 signatures, one per input, carried in each input's witness.
- **B1–B3**: blinded messages, the outputs the mint will sign.
- **Why outputs need no key**: a blinded message has no owner key the mint could check; the binding comes entirely from the inputs' signatures.

## Speaker note

- An illustration without vector values. Specified in cashubtc/nuts#443; not implemented on the federation branches.
