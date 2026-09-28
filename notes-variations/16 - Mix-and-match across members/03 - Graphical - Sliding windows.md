# 16.03 · Sliding windows

Variation 3 of slide 16 (Mix-and-match across members) · lens: Graphical · deck `fcv-c-ordering` page 5 · 5 steps · script 125 words, about 55 s

## Script

The geometry of the regression test. t = 3, n = 4. The paid quote is in the centre, four blinded outputs A to D around it. Each arc is one member's request of three consecutive outputs. Paid: 3.

**[1]** m1's arc covers A, B and C. Each gets one share.

**[2]** m2 covers B, C and D. B and C have two shares, D has one.

**[3]** m3 covers C, D and A. C reaches three shares, the first complete signature.

**[4]** m4 covers D, A and B. A, B and D reach three. Signed: 4, against 3 paid.

**[5]** All four outputs complete. Four arcs of three outputs give twelve shares. At three shares per output, twelve shares make four signatures. Every single request had the paid size.

## Background

- **t and n**: t = 3 shares complete a signature; there are n = 4 members.
- **Cyclic window**: member i's request starts at output i and wraps around: ABC, BCD, CDA, DAB. Every output lies in exactly three of the four windows.
- **Counting**: each member contributes one share to each output in its window. Four members times three outputs is twelve shares; twelve divided by t = 3 is four complete outputs.
- **Regression test**: `naive_local_signing_allows_sliding_window_quorum_cover` in `crates/cdk-common/src/federation/signing.rs` signs exactly these four windows without ordering and asserts that every output collects t shares.
