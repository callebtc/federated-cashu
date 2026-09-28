# 36.04 · Components by attacker capability

Variation 4 of slide 36 (Federation components) · lens: Framing: by attacker capability · deck `fcv-f-client-intent` page 41 · 6 steps · script 139 words, about 60 s

## Script

Each row: a capability, its effect without the component, and the component that stops it.

**[1]** Whoever holds the whole key signs any output alone. With Shamir shares from a DKG, no machine sees the key.

**[2]** Members that sign on receipt let a client obtain two output sets for one set of inputs. Operation IDs and AlephBFT order come before signing.

**[3]** An invalid share breaks the aggregate. The wallet checks each share against the member's public share K i and drops bad ones.

**[4]** Members going offline or withholding shares block a signature. Any t responses suffice.

**[5]** One operator of the funding backend controls the funds. The FROST treasury needs t signers from the roster.

**[6]** A receiving member sees the proofs and rewrites the spend to its own outputs. The fix, every v3 input signing the transcript, is specified, not implemented.

## Background

- **Shamir shares**: points on a random polynomial whose constant term is the key; any t points determine it, fewer reveal nothing.
- **Mix-and-match**: members signing different requests for the same inputs, letting a client collect more output value than it put in.
- **Public share K_i**: k_i·g2, member i's share of the public key; the wallet checks each share C′_i with the pairing e(C′_i, g2) = e(B′, K_i) (`verify_blind_signature_share`).
- **Funding backend**: the Lightning or on-chain wallet that holds the bitcoin behind the tokens.
- **Last row**: the proof-rewriting attack of this section, SEC-2026-07-17-01.

## Speaker note

- The last row is specified in cashubtc/nuts#443, not implemented; SEC-2026-07-17-01 is open on bls-federation.
