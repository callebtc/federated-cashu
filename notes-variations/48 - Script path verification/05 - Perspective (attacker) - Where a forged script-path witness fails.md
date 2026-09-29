# 48.05 · Where a forged script-path witness fails

Variation 5 of slide 48 (Script path verification) · lens: Perspective: attacker · deck `fcv-i-nutroot-spend` page 15 · 4 steps · script 139 words, about 60 s

## Script

**[1]** A revealed leaf that is not in the tree fails at step 2: another root, another tweak, and K + t·G misses the secret. Padding the path with a fourth hash fails at step 1.

**[2]** Revealing the commit leaf fails at step 4: commit has no satisfaction rule. A leaf of unallocated type 0x05 fails at step 3, although its commitment verifies.

**[3]** Meeting n = 2 with two signatures by one key fails at step 4, because distinct keys are counted, not signatures. More signatures than the leaf has keys also fails there.

**[4]** Spending an after leaf early fails on the verifier's clock. Replaying a witness in another transaction fails because the signature covers only this input digest. A leaf listing 02‖x and 03‖x would count one signer twice; leaf validation rejects it. Every spendable leaf names a key.

## Background

- **Forged leaf**: any change to the leaf bytes changes the leaf hash, the root and the tweak, so K + t·G lands on a different point.
- **Replay**: reusing a valid witness elsewhere. The input digest binds it to one input of one transaction.
- **Unallocated types**: 0x05 and above are reserved; an unknown type is unsatisfiable.
- **02‖x and 03‖x**: two compressed keys with the same x-coordinate and opposite y parity. BIP-340 verifies x-only, so one signature verifies for both.
- **No keyless path**: a hashlock leaf also requires n key signatures, so a published preimage lets no one else spend. A keyless path could be replayed by anyone who saw its witness.

## Speaker note

- NUT-10 states the shared-x rule under leaf validation, "enforced when building and when verifying a disclosed tree"; the four mint verification steps do not list it separately. The script therefore says "leaf validation rejects it" and does not attribute it to a specific mint step.
