# 04.02 · Threshold parameters: validation rules

Variation 2 of slide 04 (What is a federation) · lens: Advanced · deck `fcv-a-bls` page 4 · 4 steps · script 139 words, about 60 s

## Script

**[1]** Three checks, in cdk-common, `federation/config.rs`. `ThresholdParams::validate` is structural: n ≥ 2 and 1 ≤ t ≤ c ≤ n. Every configuration must pass it.

**[2]** `validate_bft_safety` adds the fault model: f = ⌊(n − 1)/3⌋, t ≥ f + 1, c ≥ n − f. Production members and wallet imports run it. The table lists the admissible t per n. The deck uses n = 5, t = 3, c = 4.

**[3]** The payment policy `MemberQuorum` needs c ≤ q ≤ n. `DevelopmentSingleObservation`, q = 1, is for tests only.

**[4]** Two sets of c members share at least n − 2f ≥ f + 1 members, so one of them is honest. At n = 5 the overlap is 3. f Byzantine members hold fewer than t shares. And t ≤ c: every set that can commit can also sign.

## Background

- **Structural versus safety validation**: `validate` rejects configurations that cannot work at all (zero thresholds, thresholds above n, c below t). `validate_bft_safety` additionally rejects configurations that work but are unsafe under f Byzantine members. The code keeps them separate so tests can use weaker quorums explicitly.
- **Quorum intersection**: with n = 5 and c = 4, the sets {m1, m2, m3, m4} and {m2, m3, m4, m5} share m2, m3 and m4. At most one of those three is Byzantine, so at least two honest members saw both decisions. Honest members never agree to two conflicting orders, so two conflicting operations cannot both be committed.
- **Why n − 2f ≥ f + 1**: BFT requires n ≥ 3f + 1. Subtract 2f from both sides.
- **Table rows**: for each n, f = ⌊(n − 1)/3⌋ and c = n − f. t ranges from f + 1 to c; q ranges from c to n. Example n = 10: f = 3, c = 7, t from 4 to 7, q from 7 to 10.
- **`with_bft_consensus`**: a constructor that takes n and t and computes c = n − ⌊(n − 1)/3⌋.
- **Payment observation policy**: `MemberQuorum { required }` is the policy for real payment backends. `DevelopmentSingleObservation` lets one observation finalize a quote and is meant for tests.

## Speaker note

- The slide says `validate` is one "every configuration passes". Read it as "every configuration must pass": `ThresholdParams::new` calls `validate`, and `validate_bft_safety` calls it first.
