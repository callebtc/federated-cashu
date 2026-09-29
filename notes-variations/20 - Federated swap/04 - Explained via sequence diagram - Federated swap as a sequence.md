# 20.04 · Federated swap as a sequence

Variation 4 of slide 20 (Federated swap) · lens: Explained via sequence diagram · deck `fcv-c-ordering` page 30 · 6 steps · script 129 words, about 55 s

## Script

A federated swap as a sequence diagram. n = 4, t = 3, c = 3.

**[1]** The wallet sends POST /v1/swap with the same body to all four members.

**[2]** m1 to m3 pass admission and hand the envelope to consensus. m4 is behind the log. Its status is lagging, so it fails closed.

**[3]** m1, m2 and m3 finalize the swap as entry 41. Three members are enough for c = 3.

**[4]** Each applying member spends P1 and P2 and stores its shares for A and B. m4 answers with NodeLagging and no shares.

**[5]** The wallet receives three shares per output. It checks each share against that member's public share Kᵢ, interpolates and unblinds.

**[6]** Later, m4 catches up, replays entry 41, and holds the same state and its own shares.

## Background

- **Sequence diagram**: time runs downward; each vertical line is one participant, each arrow a message.
- **n = 4, c = 3**: c = n − ⌊(n − 1)/3⌋ = 4 − 1 = 3, so three members can order without m4.
- **Lagging**: the member's operation count is below a peer's. It returns `NodeLagging` instead of shares.
- **Checking a share against Kᵢ**: the pairing check e(C′ᵢ, G₂) = e(B′, Kᵢ), with Kᵢ = kᵢ·G₂ the member's published public share.
- **Replay**: applying the accepted entry after catch-up. It marks P1 and P2 spent and writes m4's own share rows, so m4 ends in the same state as its peers.

## Speaker note

- Not shown: for swaps, members queue the envelope in a deterministic publisher order derived from the operation ID; a lower-ranked member waits for the prior publisher before submitting (`crates/cdk-axum/src/federation/wallet_operation_publisher.rs`). The script says "hand the envelope to consensus" rather than "each submits".
