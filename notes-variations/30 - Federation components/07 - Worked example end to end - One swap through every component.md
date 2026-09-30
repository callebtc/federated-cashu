# 30.07 · One swap through every component

Variation 7 of slide 30 (Federation components) · lens: Worked example end to end · deck `fcv-f-client-intent` page 44 · 7 steps · script 138 words, about 60 s

## Script

One swap through seven stages, each tagged with its summary row.

**[1]** Sign inputs, in the wallet: each v3 input signs its input digest. This is client intent, specified in NUT-10 and not implemented on the branch.

**[2]** Fan out: the wallet sends the same request to every member.

**[3]** Admit: each member runs admission checks, wraps the request in an envelope and derives its operation ID.

**[4]** Order: AlephBFT orders the operations, and the first spend of the inputs wins.

**[5]** Apply and sign: each member computes its share C′ i as k i times B′, with its DKG share k i.

**[6]** Aggregate: the wallet checks t shares and interpolates them into one signature.

**[7]** Verify: the wallet unblinds and checks the result against K with a pairing. Custody does not act in a swap; FROST signs treasury transactions for payments and withdrawals.

## Background

- **C′_i = k_i·B′**: a member's blind signature share: its key share times the blinded message.
- **Interpolation**: Lagrange interpolation at x = 0 combines t shares into C′ = k·B′ without anyone knowing k.
- **Unblind**: the wallet removes its blinding factor from C′ to get C, the signature on its secret.
- **Pairing check**: confirms C against the mint's public key K.
- **Custody**: the FROST-held treasury; it moves bitcoin for mints (deposits) and melts (payments, withdrawals), not for swaps.

## Speaker note

- Stage 1 is specified in cashubtc/nuts#443, not implemented on bls-federation or bls-federation-bdk-frost.
