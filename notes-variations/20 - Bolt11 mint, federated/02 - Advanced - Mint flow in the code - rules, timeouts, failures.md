# 20.02 · Mint flow in the code: rules, timeouts, failures

Variation 2 of slide 20 (Bolt11 mint, federated) · lens: Advanced · deck `fcv-d-flows-dkg` page 4 · 6 steps · script 137 words, about 60 s

## Script

**[1]** The wallet posts to its preferred coordinator, then to each other member, 10 seconds per attempt; a definitive rejection ends the loop. The member creates the invoice, submits MintQuote locked on the quote ID, and replies after acceptance.

**[2]** The wallet polls status until t members return the quote: up to 100 attempts, 50 milliseconds apart. A failed check never creates a second quote.

**[3]** A member probes its backend on a payment event, a scheduled scan or a status request, and submits its own MintQuotePayment.

**[4]** Paid needs q matching observations, c ≤ q ≤ n. Single observation is test-only.

**[5]** For status, the wallet groups identical responses, ignoring updated_at, and needs t.

**[6]** For a mint, members wait for paid locally, else PendingQuote. The Mint is ordered; the wallet checks each share against Kᵢ and stops at t valid shares.

## Background

- **Preferred coordinator**: the wallet setting `quote_coordinator_member_id`. By default it is the first member ID in the roster. "Healthy" means the first member that returns a usable quote within 10 s.
- **Definitive rejection**: an error that another member would return as well, such as an invalid request. Timeouts and other errors move on to the next member.
- **Visibility check**: confirms that t members have applied the MintQuote item, so later status and mint requests find the quote.
- **updated_at (NUT-04)**: each member sets its own timestamp, so the wallet sets it to zero before comparing responses.
- **Observation quorum**: the policy `MemberQuorum { required }`. Config validation rejects required = 0, required > n and required < c. `DevelopmentSingleObservation` is documented as a test/development policy.
- **PendingQuote**: the error a member returns when the quote does not become paid in its own state within the operation submission timeout.
- **Share check against Kᵢ**: the pairing equation e(C′ᵢ, G₂) = e(B′, Kᵢ) confirms that member i used its key share.
- **v3 keyset**: a BLS12-381 keyset; the wallet rejects outputs that do not target an active v3 keyset of the federation.

## Speaker note

- Row 6 says each member "submits Mint". In the code, Mint, Melt and Swap are coordinated: one member, chosen by a rank derived from the operation ID, publishes the envelope. The others wait 3 s per rank for its result and publish only if none arrives (crates/cdk-axum/src/federation/wallet_operation_publisher.rs). Every member signs when it applies the accepted Mint.
- `member_quorum(q)` is only a constructor. The c ≤ q ≤ n check is in the policy validation in crates/cdk-common/src/federation/config.rs.
- The code probes the backend on more triggers than the three listed, including right after quote creation and on a mint request.
