# 04.06 · Offline and Byzantine members at n = 5

Variation 6 of slide 04 (What is a federation) · lens: Framing: failure mode · deck `fcv-a-bls` page 8 · 5 steps · script 128 words, about 55 s

## Script

Four cases at n = 5. Ordering needs c = 4 members; signing needs t = 3 shares.

**[1]** All five members online: operations are ordered, then signed.

**[2]** m5 offline: four members still commit, and four can sign. One offline member changes nothing.

**[3]** m4 and m5 offline: three members cannot reach c = 4. Nothing is accepted, so no member signs, although three shares would be enough for a signature.

**[4]** m1 Byzantine: the four honest members still reach c, so m1 cannot block the order. Its share alone is one, below t.

**[5]** So t = 3 below c = 4 is safe only because shares are produced after the operation is accepted. Members that signed on receipt could each be shown a different output set for the same quote.

## Background

- **Offline versus Byzantine**: an offline member sends nothing. A Byzantine member may send anything, including conflicting messages to different peers. The protocol tolerates up to f = 1 of either kind at n = 5.
- **Liveness and safety**: with only three members online the federation stops making progress (no liveness), but it issues nothing incorrect (safety holds). It resumes when a fourth member returns.
- **Why ordering needs c members**: any two sets of c = 4 members out of 5 share at least three members, so two conflicting operations cannot both be committed.
- **Mix-and-match**: if members signed each request on arrival, a wallet could send different output sets for one paid quote to different members and collect t shares for more outputs than it paid for. Ordering first gives every member the same single output set.
- **Why a Byzantine member cannot block**: consensus needs c = 4 agreeing members; the other four are honest and reach c without it.
