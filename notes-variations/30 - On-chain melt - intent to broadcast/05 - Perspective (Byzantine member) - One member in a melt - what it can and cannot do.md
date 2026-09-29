# 30.05 · One member in a melt: what it can and cannot do

Variation 5 of slide 30 (On-chain melt - intent to broadcast) · lens: Perspective: Byzantine member · deck `fcv-e-membership-custody` page 39 · 4 steps · script 140 words, about 60 s

## Script

One Byzantine member in an on-chain melt: it may deviate arbitrarily from the protocol.

**[1]** It may propose a transaction; the proposer field is diagnostic and grants no authority. It may broadcast, but only the persisted TransactionSigned bytes.

**[2]** It cannot pay a different address: every member checks outputs against the intent's destination script. It cannot take a higher fee: fee and fee rate are recomputed, and each intent carries a maximum fee. It cannot spend a coin that is not accepted and spendable; each UTXO has one reservation owner.

**[3]** It cannot get another message signed: signers rebuild the sighash from the accepted transaction. It cannot broadcast different bytes: the broadcast intent names one txid.

**[4]** It cannot skip from Melt to broadcast: that needs an accepted proposal, TransactionSigned and a broadcast intent. The FROST coordinator only aggregates shares and has no authority.

## Background

- **Byzantine member**: a member that may lie, equivocate or send malformed data. The design tolerates up to f of them.
- **destination_script**: the output script of the user's address, fixed in the payment intent when the melt is accepted.
- **maximum_fee_sat**: the fee cap carried by each payment intent; the recomputed fee share must not exceed it.
- **Reservation owner**: each UTXO can be reserved by exactly one accepted proposal, so two proposals cannot spend the same coin.
- **Sighash rebuild**: each signer computes the sighash from the accepted transaction itself; a signing request for any other message is refused.
- **FROST coordinator**: the member that collects commitments and signature shares and combines them. It is replaceable and cannot change what is signed.
