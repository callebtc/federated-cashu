# 34.03 · One transaction digest, one digest per input

Variation 3 of slide 34 (Per-input signing digest) · lens: Graphical · deck `fcv-f-client-intent` page 22 · 5 steps · script 110 words, about 45 s

## Script

The multi-input vector: two proof inputs, 8 and 4 sat, and two outputs, 8 and 4, in one transcript.

**[1]** The whole transcript hashes to one transaction digest, 9517f426, shared by both inputs.

**[2]** Each input's own record hashes to its input ID: 44002fef for the first, 08960176 for the second.

**[3]** Each input ID combines with the shared transaction digest into its own input digest: 3c5ccb85 and 720c3e06.

**[4]** Each input's key signs its own digest. Sigma 1 is 51133bcf, sigma 2 is 5069c493.

**[5]** The crossed lines: sigma 1 does not verify over the second input's digest, and sigma 2 does not verify over the first's. Neither signature transfers to the other input.

## Background

- **Multi-input vector**: the NUT-10 swap vector with a second 4-sat proof appended (NUT-13 V3 counter 1) and outputs of 8 and 4.
- **input_digest**: `tagged_hash("Cashu_TransactionInput", transaction_digest ‖ input_id)`; one per input.
- **σ (sigma)**: a BIP-340 signature by the input's private key over its input digest.
- **Why neither transfers**: a signature is valid only for the message it was made over; the two inputs have different messages.

## Speaker note

- The off-diagonal failures follow the spec ("Each signature MUST verify only against its corresponding input_digest"); they were recomputed with a BIP-340 verifier while preparing these notes. Specified in cashubtc/nuts#443; not implemented on the federation branches.
