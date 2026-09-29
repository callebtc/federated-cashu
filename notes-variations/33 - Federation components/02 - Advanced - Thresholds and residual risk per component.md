# 33.02 · Thresholds and residual risk per component

Variation 2 of slide 33 (Federation components) · lens: Advanced · deck `fcv-f-client-intent` page 39 · 3 steps · script 139 words, about 60 s

## Script

Parameters and documented residual risks, per component.

**[1]** Issuance needs t shares per signature, interpolated in the wallet. Ordering uses c equal to n minus the floor of n minus 1 over 3; for 5 members, c is 4. t below c is safe only because members sign after the operation is ordered. Members behind the log fail closed and return no shares.

**[2]** Payments need q observations, q at least c, and deposits also need confirmation depth. A reorg after issuance raises an alarm and does not unmint. Custody: t FROST signers, same roster. Single-observation and fakewallet backends are test-only.

**[3]** Keys come from two ceremonies on one roster, and a membership change is a new federation. Client intent: v3 inputs sign the transcript, specified in nuts#443, not implemented. With today's bearer proofs the receiving member is trusted; SEC-2026-07-17-01 is open.

## Background

- **c = n − ⌊(n − 1)/3⌋**: the consensus threshold. With f = ⌊(n − 1)/3⌋ Byzantine members tolerated, any two sets of c members overlap in at least one honest member.
- **Why t ≤ c is safe here**: shares are produced only for the exact operation consensus accepted. If members signed before ordering, a lower signing threshold would allow two conflicting operations to each collect t shares.
- **Fail closed**: a lagging member refuses to sign rather than signing on stale state.
- **q**: the payment observation quorum; production requires q ≥ c matching member observations before a payment counts.
- **Reorg**: a chain reorganization removes a deposit's confirmation; before issuance it cancels the deposit, after issuance it only raises an alarm.
- **Two ceremonies**: Pedersen DKG for the BLS issuance key, FROST DKG for the treasury key, on the same roster.

## Speaker note

- "Pre-v3 bearer proofs" on the slide: on bls-federation the federated keysets are version 02 (BLS), but without the nuts#443 rules their proofs are still bearer proofs. The residual risk is the same.
- Sources: `FEDERATION_NOTES.md` (thresholds, "Why signing threshold can be below consensus threshold", reorg, test-only backends, membership) and the 2026-07-17 security audit.
