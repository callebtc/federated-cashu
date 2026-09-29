# removed.07 · Both sides of mint and melt need the same quorum

Variation 7 of slide removed (Funding backends) · lens: Framing: the constraint that forces the design · deck `fcv-e-membership-custody` page 25 · 4 steps · script 132 words, about 55 s

## Script

Four cases where issuance and custody use different quorums.

**[1]** Mint, deposit. Issuing needs t members, but one member can report a deposit that never arrived. Ecash is issued without reserves.

**[2]** Mint, after issuance. Issuing needed t members, but one member can later sweep the deposit. The outstanding ecash is unbacked.

**[3]** Melt, payout. Burning the proofs needs t members, but one member can redirect the payout. The proofs are spent and the user is not paid.

**[4]** Melt, ledger. The payout needs t signers, but one member alone can issue change or reopen the proofs. Ledger and treasury disagree.

The rule that follows: both sides use the same roster and the same consensus history, and the custody threshold is not weaker than the ecash threshold. In CDK the FROST signing threshold is exactly t.

## Background

- **Issuance quorum**: the t members whose signature shares make an ecash signature, after consensus has ordered the operation.
- **Custody quorum**: the members whose cooperation is needed to move the reserves.
- **Burning proofs**: marking spent the ecash proofs a user hands in for a melt, so they cannot be used again.
- **Change**: new ecash the mint signs when the melt inputs exceed the payout plus fees.
- **Reopen proofs**: marking spent proofs as unspent again, which would let them be spent twice.
- **Ledger vs. treasury**: the ledger is the ecash state (quotes, proofs, signatures); the treasury is the bitcoin. Each must change only when the other does.
- **Same consensus history**: both custody and issuance act on the same ordered journal, so a payout and the burn of its proofs refer to the same accepted operation.
