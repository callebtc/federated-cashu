# 18.05 · What one faulty member can and cannot do

Variation 5 of slide 18 (Consensus before signing) · lens: Perspective: Byzantine member · deck `fcv-c-ordering` page 23 · 3 steps · script 139 words, about 60 s

## Script

One faulty member, m5. n = 5, f = 1, c = 4, t = 3.

**[1]** Faulty means Byzantine: m5 may behave arbitrarily.

**[2]** It cannot complete a signature alone: t ≥ f + 1 forces at least one honest share. It cannot make honest members sign unfinalized outputs; they sign only the exact outputs of an ordered entry. It cannot finalize two conflicting operations: any two sets of c members share an honest one. It cannot feed a lagging member a false history: catch-up verifies a checkpoint signed by c members.

**[3]** It can withhold its shares and votes; the other four still reach t and c. It can race a rewritten swap of proofs it has seen, unless a witness commits to the outputs. It can get an invalid proof ordered first; that fails at apply and locks nothing.

## Background

- **Byzantine member**: a member that may deviate from the protocol in any way, including sending different messages to different peers.
- **t ≥ f + 1**: any t shares include at least one from an honest member, and honest members sign only finalized outputs.
- **Quorum-signed checkpoint**: a statement signed by c members committing to the accepted-operation order and the resulting state digests. A recovering member verifies the signatures, fetches the missing entries from peers in bounded pages, replays them, and becomes ready only when its state equals the checkpoint.
- **Rewritten swap**: the wallet fans out its proofs to every member; a member that sees them can submit a swap of the same proofs to its own outputs (main deck, section 1.6).
- **Witness committing to outputs**: a signature in the proof that covers the transaction's outputs, so a rewritten swap fails verification.
- **Invalid proof ordered first**: proof Ys are not conflict keys, so an invalid proof carrying someone's Y fails at apply and does not block the owner's valid swap.

## Speaker note

- The slide says catch-up "needs a certificate quorum of c". Range-based catch-up certificates were replaced by quorum-signed checkpoints (`bls-federation:docs/federated-cashu-checkpoint-architecture.md`). The checkpoint quorum is c signatures (`consensus_threshold` in `checkpoint.rs`). The script uses the checkpoint term.
- "Unless a witness commits to the outputs": the v3 per-input witness over the transaction transcript is specified in cashubtc/nuts#443 and not implemented on either federation branch. Today only proofs with opt-in NUT-11 SIG_ALL bind outputs.
