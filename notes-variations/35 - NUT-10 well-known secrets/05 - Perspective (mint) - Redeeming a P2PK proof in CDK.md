# 35.05 · Redeeming a P2PK proof in CDK

Variation 5 of slide 35 (NUT-10 well-known secrets) · lens: Perspective: mint · deck `fcv-g-json-taproot` page 7 · 5 steps · script 138 words, about 60 s

## Script

The NUT-11 proof in a CDK swap request. process_swap_request runs these checks in order.

**[1]** verify_inputs: the input count is within the mint's limit, secret and witness are at most 1024 characters each, and no input is duplicated. Here one input, a 195-character secret.

**[2]** verify_proofs, called at the end of verify_inputs: the mint computes Y from the secret and checks C = k·Y with the key for the amount.

**[3]** verify_spending_conditions parses the NUT-10 secret. If any input is SIG_ALL, all inputs are checked jointly. Here it is SIG_INPUTS, so this input is checked alone.

**[4]** The P2PK check: SHA-256 of the secret, and valid signatures from at least n_sigs distinct listed keys, here the data key.

**[5]** Then the swap saga: Y is stored as pending, which fails if Y is already known; the outputs are signed; Y is marked spent.

## Background

- **process_swap_request**: CDK's handler for a NUT-03 swap, in `crates/cdk/src/mint/swap/mod.rs`.
- **Input limits**: `max_inputs` is mint configuration; the 1024 limit is `MAX_PROOF_CONTENT_LEN` in `crates/cdk/src/mint/verification.rs`. The witness is measured after serializing it to JSON.
- **verify_proofs**: checks the mint signature through the signatory: C must equal k·Y for the key of the proof's amount and keyset.
- **verify_spending_conditions**: in `crates/cashu/src/nuts/nut10/mod.rs`. It dispatches to a joint SIG_ALL check or to per-input P2PK and HTLC checks; plain secrets are skipped.
- **Saga**: a sequence of steps with compensation on failure. TX1 records the inputs as pending and the outputs; the outputs are blind-signed; TX2 stores the signatures and marks the inputs spent.
- **Pending**: the NUT-07 state between the two transactions. Inserting a Y that already exists fails, which blocks a concurrent second spend.

## Speaker note

- In the code, verify_proofs is called inside verify_inputs (after the uniqueness and keyset checks), not as a separate call from process_swap_request. The slide's order still holds. Checked against `crates/cdk/src/mint/verification.rs` and `swap/mod.rs` in the current cdk tree.
