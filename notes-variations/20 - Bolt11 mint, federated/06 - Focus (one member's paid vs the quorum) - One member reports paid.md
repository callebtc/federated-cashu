# 20.06 · One member reports paid

Variation 6 of slide 20 (Bolt11 mint, federated) · lens: Focus: one member's paid vs the quorum · deck `fcv-d-flows-dkg` page 8 · 4 steps · script 137 words, about 60 s

## Script

Five members: f = 1 may be faulty, so c = 4. Here q = 4 and t = 3. The invoice is unpaid, and m5 is Byzantine.

**[1]** m5 submits a paid observation: one of the q = 4 needed. The other four see no payment, so the quote stays unpaid on every member.

**[2]** Status: four members answer unpaid, m5 answers paid. Four identical answers meet t = 3, so the wallet reads unpaid.

**[3]** On a mint request, the four honest members wait for paid and return PendingQuote. m5 alone returns a share. One share is below t, so no signature forms.

**[4]** The bounds behind this: with q ≥ c, at least q − f = 3 matching observations come from honest members. With t ≥ f + 1, any t identical answers include an honest member.

## Background

- **Byzantine member**: a member that may behave arbitrarily, including lying and signing anything.
- **f and c**: f = ⌊(n − 1)/3⌋ is the number of Byzantine members tolerated; c = n − f is the consensus threshold.
- **q ≥ c**: among q matching observations at most f are from Byzantine members, so a payment is only accepted if honest members saw it.
- **t ≥ f + 1**: f members cannot produce t shares alone, and t identical status answers cannot all come from Byzantine members. Config validation for production requires t ≥ f + 1.
- **PendingQuote**: an honest member probes its backend, waits for the quote to turn paid in its own state, and returns this error when the wait times out.
- **Lone share**: C′₅ = k₅·B′ is one point of the sharing; with t = 3 it reveals nothing and cannot be unblinded into a valid signature.
