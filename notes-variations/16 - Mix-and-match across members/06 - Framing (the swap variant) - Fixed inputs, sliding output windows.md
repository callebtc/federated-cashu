# 16.06 · Fixed inputs, sliding output windows

Variation 6 of slide 16 (Mix-and-match across members) · lens: Framing: the swap variant · deck `fcv-c-ordering` page 8 · 4 steps · script 140 words, about 60 s

## Script

The swap version of the attack. n = 4, t = 3. The inputs are fixed; the output windows slide.

**[1]** Three proofs of value 1, P1 to P3, are in every request. Each member receives a balanced swap with a different window of three outputs: A B C, B C D, C D A and D A B.

**[2]** If members sign on receipt, every output collects three shares. Four outputs complete from inputs worth three.

**[3]** With ordering, one envelope is accepted first, here A B C. Every member applies it, marks P1 to P3 spent and signs A, B and C.

**[4]** The other three envelopes spend the same inputs. They fail at apply with TokenAlreadySpent, and D gets no shares. A swap has no conflict key; the proof store at apply is the spend lock. The wallet-level test is local_federated_members_reject_sliding_window_swap_output_attack.

## Background

- **Swap (NUT-03)**: exchange existing proofs for new outputs of the same total value, minus fees. Here three inputs of 1 for three outputs of 1.
- **Balanced**: the input total equals the output total plus fees. Every window of three outputs is balanced against the same three inputs.
- **Envelope**: the canonical encoding of one request. Different output windows are different envelopes with different operation IDs.
- **Apply**: the deterministic step that executes an ordered operation against a member's database. For a swap it marks the inputs spent and signs the outputs.
- **Spend lock**: the proof state stored at apply. The first accepted swap marks P1 to P3 spent; every later swap of the same proofs finds them spent and fails with `TokenAlreadySpent`.

## Speaker note

- The left grid is the outcome if members signed on receipt; it is not a run of the wallet test. The test (`crates/cdk/src/wallet/federation/tests.rs`) asserts one success and three failures and accepts either "Token Already Spent" or a missing persisted share as the failure text, so it does not pin `TokenAlreadySpent` exactly. The spend lock at apply is `TokenAlreadySpent` (`apply_federation_swap`).
