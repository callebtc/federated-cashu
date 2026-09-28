# 30.01 · Paying 40,000 sat from the federation's coins

Variation 1 of slide 30 (On-chain melt - intent to broadcast) · lens: Beginner · deck `fcv-e-membership-custody` page 35 · 5 steps · script 140 words, about 60 s

## Script

A user wants 40,000 sat on-chain from a federation of five.

**[1]** The wallet melts, that is redeems, eCash for 40,000 sat with a fee cap of 2,000 sat. The members order the Melt operation and reserve the proofs. No bitcoin has moved.

**[2]** One member drafts the transaction. It spends one federation coin of 100,000 sat, pays 40,000 sat to the user's address, returns 58,800 sat as change to a federation address, and leaves 1,200 sat as fee.

**[3]** Every member checks it independently. Inputs equal outputs plus fee. The fee is under the cap. The destination is the quote's address. The input belongs to the federation.

**[4]** Any three of the five members, here m1, m3 and m4, produce one Schnorr signature with FROST, a threshold signing protocol.

**[5]** The signed bytes are stored first, then broadcast. A retry sends the same bytes.

## Background

- **Melt**: redeeming eCash for a payment made by the mint (NUT-05); here an on-chain payment to the user's address.
- **Fee cap**: the maximum fee the user accepted in the melt quote (`maximum_fee_sat` per payment intent).
- **Change output**: the part of the input that goes back to a new federation address.
- **Value conservation**: inputs equal outputs plus fee: 100,000 = 40,000 + 58,800 + 1,200.
- **Schnorr signature via FROST**: t members produce one BIP340 signature. On-chain the input cannot be distinguished from a single-key Taproot key-path spend.
- **Store before broadcast**: the signed transaction is recorded through consensus before any member sends it, so every retry uses identical bytes and the same txid.

## Speaker note

- The amounts (100,000 / 40,000 / 58,800 / 1,200, cap 2,000) and the choice of m1, m3, m4 are toy numbers for the slide, not from code tests.
