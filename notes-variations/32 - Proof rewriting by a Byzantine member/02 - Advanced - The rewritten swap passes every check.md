# 32.02 · The rewritten swap passes every check

Variation 2 of slide 32 (Proof rewriting by a Byzantine member) · lens: Advanced · deck `fcv-f-client-intent` page 4 · 4 steps · script 138 words, about 60 s

## Script

The wallet's swap and m3's rewrite, through the member pipeline on bls-federation.

**[1]** Admission: unique inputs, unique outputs on v3 keysets, balanced amounts, proof and witness sizes within limits. Both swaps pass.

**[2]** Envelope: each swap is signed by a roster member's identity key, m1 for the wallet's, m3 for its own. That signature names the submitting member, not the owner of the inputs.

**[3]** Consensus orders m3's swap as 57 and the wallet's as 58. Apply verifies the proofs, marks them spent and signs X and Y. Operation 58 finds its inputs spent.

**[4]** The row that would catch the rewrite is an owner signature over the outputs. A bearer proof under pre-v3 rules has none. The existing mitigation is P2PK with SIG_ALL from NUT-11: a changed output changes the operation ID and fails apply. The branch does not require it.

## Background

- **Admission**: side-effect-free checks a member runs before submitting an operation to consensus. They do not read spent state; apply, after ordering, is the authoritative spend check.
- **Envelope**: the federation wrapper around a wallet request, signed with the submitting member's identity key. `FederationOperationEnvelope::verify_authorization` checks that a roster member signed it; it checks nothing about the proof owner.
- **Operation ID**: a deterministic identifier derived from the operation's content. Signature shares are bound to it, so shares for one operation cannot be reused for another.
- **Apply**: executing an ordered operation against local state: verify the proofs, mark them spent, produce signature shares for the outputs.
- **P2PK and SIG_ALL (NUT-11)**: a P2PK proof can only be spent with a signature by a named key. With the SIG_ALL flag, that signature covers all inputs and all outputs, so changing the outputs invalidates it.
- **SEC-2026-07-17-01**: the audit finding for this attack; not a BLS bug, not mix-and-match, and not addressed by fan-out or DKG.

## Speaker note

- The Admission rows compress several places in the code. The pre-consensus swap check (`validate_federated_swap_submission`) covers v3 and unique outputs, proof content size bounds, unique inputs, BLS proof verification and spending conditions, plus an operation-local balance audit; the fee-inclusive balance check (`verify_federation_transaction_balanced_with_config`) runs at apply. Either way m3's swap passes like the wallet's.
- "Pre-v3" here means the rules before nuts#443. On bls-federation the federated keysets are already keyset version 02 (BLS) and non-v3 inputs and outputs are rejected, but the branch applies the old secret rules to them: random-string or NUT-11 secrets, no transcript witness.
- The SIG_ALL behaviour is from `FEDERATION_NOTES.md` ("tests prove a SIG_ALL output mutation changes the operation ID and fails apply"); `cdk/src/mint/federation/tests/swap.rs` also rejects the mutation before consensus admission.
