# 06.03 · Additive blinding cancels

Variation 3 of slide 06 (Blind Diffie–Hellman key exchange on secp256k1 (NUT-00)) · lens: Graphical · deck `fcv-a-bls` page 13 · 7 steps · script 111 words, about 50 s

## Script

Wallet on the left, mint on the right. Each point is drawn as a bar.

**[1]** The wallet starts with Y.

**[2]** It appends the blinding term r·G. Together they are one point, B′.

**[3]** B′ goes to the mint. The mint receives a single point.

**[4]** The mint multiplies by k. Both parts scale: k·Y and k·r·G. Their sum is C′ = k·B′.

**[5]** C′ comes back. The wallet knows r and the public key K, and k·r·G equals r·K. It subtracts r·K.

**[6]** The blinding term cancels. C = k·Y is left.

**[7]** At redemption the wallet sends x and C. The mint recomputes k·Y from x with its private key and compares it with C.

## Background

- **Bars**: a drawing of point addition. A bar made of two segments is the sum of two points; stretching a bar stands for multiplying by k. Points on a curve have no length; the picture only shows which terms are added and scaled.
- **Additive blinding**: B′ = Y + r·G. The blinding term r·G is a point added to Y.
- **Why k·r·G = r·K**: K = k·G, so r·K = r·k·G = k·r·G. The wallet can compute r·K without knowing k.
- **Why the mint cannot separate B′**: with r uniformly random, r·G is a uniformly random point, so Y + r·G is uniformly random too.
- **Redemption check**: the mint computes Y = hash_to_curve(x) and k·Y. This check needs k.

## Speaker note

- Bar lengths and the stretch for "·k" are illustrative only (the code draws k as a fixed 1.5× stretch).
