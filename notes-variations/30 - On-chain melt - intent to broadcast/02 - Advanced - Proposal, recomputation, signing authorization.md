# 30.02 · Proposal, recomputation, signing authorization

Variation 2 of slide 30 (On-chain melt - intent to broadcast) · lens: Advanced · deck `fcv-e-membership-custody` page 36 · 3 steps · script 136 words, about 60 s

## Script

Three structures in transaction_proposal.rs.

**[1]** The proposal is a consensus operation. It names the batch, its payment intents, and a scope: root epoch, application, key epoch, network, policy. The proposer field grants no authority. It carries the selected inputs, recipient and change outputs, the exact unsigned transaction, fee and fee rate, sighash type, a PSBT commitment and an optional replaced proposal. Limits: 64 inputs, 65 outputs, weight 400,000, 512 KiB.

**[2]** Every member recomputes the policy audit: txid from the unsigned bytes, fee, fee rate, signed weight, each intent's fee share and the Taproot sighash per input. It also checks ownership, value conservation, each intent's maximum fee, destination and network.

**[3]** A signature share is authorized for one tuple: accepted operation ID, proposal ID, txid, input index, sighash type and 32-byte sighash. It is built only in state Accepted.

## Background

- **Batch and payment intents**: each on-chain melt creates a payment intent; a batch groups intents that one transaction pays.
- **fee_rate_sat_per_kwu**: satoshis per 1,000 weight units, rounded up. Weight is the Bitcoin block-space measure; a block holds at most 4,000,000 weight units, and 400,000 is the standard transaction limit.
- **PSBT commitment**: a hash over the transaction and the ordered previous outputs being spent. It binds the proposal to exactly the data signers need.
- **Sighash**: the hash of the transaction data that a signature commits to (BIP341 for Taproot key-path spends). A signature for one sighash is useless for any other transaction or input.
- **Policy audit**: the values each member computes itself from the proposal. A member does not trust the proposer's numbers.
- **Accepted state**: the proposal has been accepted through consensus. Only then can a signing authorization be built.
- **Private plane**: FROST commitments and shares travel member to member, not through the consensus journal.
