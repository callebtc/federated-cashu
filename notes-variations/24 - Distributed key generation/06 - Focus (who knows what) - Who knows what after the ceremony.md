# 24.06 · Who knows what after the ceremony

Variation 6 of slide 24 (Distributed key generation) · lens: Focus: who knows what · deck `fcv-d-flows-dkg` page 24 · 3 steps · script 127 words, about 55 s

## Script

The toy ceremony after it ends. Rows are items, columns are who holds them.

**[1]** Each member knows its own line, but only until it has evaluated it; then the coefficients are erased. It knows the values it sent, the values it received, its own included, and its own share: 21, 33 and 45.

**[2]** Public items: the commitments Aⱼ,ₗ to every coefficient, the key K and every public share Kᵢ. Members, wallets and auditors all have these; the commitments come with the transcript.

**[3]** Nobody knows another member's share, and nobody knows k = f(0). k is 9 here only because the lines were chosen for the slide; no party adds 4 + 2 + 3. The sender keeps its evaluations, not its coefficients, so it can resend them.

## Background

- **Values received**: m2 holds f₁(2) = 6 and f₃(2) = 15, one point on each other member's line. With t = 2 a single point says nothing about a line's constant term.
- **Another member's share**: kᵢ = Σⱼ fⱼ(i) needs every member's value at i. Only member i receives all of them.
- **k = f(0)**: determined by any t shares, but no party holds t shares.
- **Commitments in the transcript**: the setup transcript in the public config contains every reveal, so wallets and auditors that import the config have the Aⱼ,ₗ.
- **Zeroize**: overwrite the memory that held a secret, so it cannot be read later.

## Speaker note

- The kept evaluations fⱼ(1) … fⱼ(n) determine member j's polynomial whenever n ≥ t. Erasing the coefficients therefore does not remove the polynomial from the participant state, which is persisted as JSON in the mint database (add_federation_dkg_participant_state in crates/cdk-sql-common/src/mint/federation/dkg.rs). I did not check whether it is deleted after completion.
- The transcript is an optional field of the public config; the "in the transcript" entry assumes it is present.
