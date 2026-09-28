# 20.03 · Quote state across three members

Variation 3 of slide 20 (Bolt11 mint, federated) · lens: Graphical · deck `fcv-d-flows-dkg` page 5 · 6 steps · script 130 words, about 55 s

## Script

The disc on the right is quote q1 as consensus records it. The ring around it counts accepted payment observations.

**[1]** The wallet requests a quote from m1.

**[2]** m1 submits the quote to consensus. The disc appears, unpaid, and m2 and m3 receive the quote.

**[3]** The wallet pays over Lightning. Each member sees the payment on its own backend and submits an observation. Each accepted observation fills one arc of the ring: 3 of q = 3.

**[4]** With q observations the quote is paid.

**[5]** The wallet reads the status from all three members and accepts it once t = 2 answers are identical.

**[6]** The wallet sends its blinded outputs. The Mint operation is ordered, the disc turns issued, and each member returns its share. The wallet combines two shares into C′.

## Background

- **Observation**: one member's consensus item stating what its own payment backend reported for the quote. It counts only if it matches the others.
- **q = 3**: with n = 3 members, c = 3, and q must lie between c and n, so every member must observe the payment.
- **t = 2**: two identical status answers are enough for the wallet, and two signature shares give one signature.
- **Issued**: the state after an accepted Mint operation that used the full paid amount; another Mint with other outputs for that quote fails.
- **C′**: the blind signature on the wallet's blinded output, combined by the wallet from t shares.
