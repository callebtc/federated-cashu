# 27 · One threshold for ecash and reserves

1.5 Custody · 3 steps · script 111 words, about 50 s

## Script

A federated mint has two things to protect: issuing ecash, and the reserves that back it.

**[1]** Issuing ecash needs three of five members. No two members can create tokens alone.

**[2]** Now assume the funding backend is an ordinary Lightning or on-chain node run by one operator. That one member can spend the reserves, or mark unpaid quotes as paid. The federation is then only as strong as that single operator: one of five.

**[3]** So the reserves need the same threshold. The treasury key is a FROST key shared by the same members, and spending it needs three of five, just like issuing ecash. Invoices, payments and withdrawals become consensus operations too.

## Background

- **Funding backend**: the Lightning node or on-chain wallet that receives payments for minting and pays out for melting.
- **Weakest link**: the security of the whole mint is the lower of the two thresholds, issuance and custody.
- **FROST**: Flexible Round-Optimized Schnorr Threshold signatures. Any t of n members produce one ordinary BIP340 Schnorr signature for a shared key.
- **Backends in the code**: federated BDK for the on-chain treasury, federated Bark for Lightning. Single-observation mode and fakewallet are for tests only.
