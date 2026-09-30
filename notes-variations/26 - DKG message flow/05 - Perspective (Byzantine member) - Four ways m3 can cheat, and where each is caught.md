# 26.05 · Four ways m3 can cheat, and where each is caught

Variation 5 of slide 26 (DKG message flow) · lens: Perspective: Byzantine member · deck `fcv-d-flows-dkg` page 31 · 4 steps · script 136 words, about 60 s

## Script

m3 is Byzantine. Four ways it can cheat, and where each one is caught.

**[1]** It sends m2 the value 16 instead of f₃(2) = 15. m2 checks it against m3's commitments; in the toy group 4¹⁶ = 29, not 34. The error is DkgCommitmentMismatch naming m3, and the ceremony cannot finish.

**[2]** It reveals a polynomial other than the one it hashed. Every receiver finds a reveal hash mismatch and rejects the reveal. Only the committed polynomial can be revealed.

**[3]** It sends different commitments to different peers. A peer that receives two different ones reports a conflicting commitment. Otherwise the members compute different transcript hashes, no hash collects n signatures, and nothing is activated.

**[4]** It stays silent. The driver waits for every roster member; at the timeout it stops and names m3. A new ceremony is needed.

## Background

- **Byzantine member**: a member that deviates arbitrarily from the protocol.
- **Commitment check**: 4^{f₃(2)} must equal A₃,₀·A₃,₁² in the toy group, fⱼ(i)·G₂ = Σₗ iˡ·Aⱼ,ₗ on the curve.
- **Attribution**: each value arrives in a request signed by the sender's identity key, so a failed check names the sender.
- **Equivocation**: sending different versions of a message to different receivers. Without a broadcast channel it is detected by the transcript signatures, which all have to be over one hash.
- **Timeout**: the driver stops after its tick limit or 600 s and lists the members it was still waiting for.

## Speaker note

- "Timeout: the run aborts" is true of the driver run. The durable ceremony record stays active, and recovery needs a new setup ID and fresh local state; there is no disqualify-and-continue.
- The value 16 and the results 29 and 34 are toy values computed for the slide.
