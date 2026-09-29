# removed.02 · Thresholds for issuance, ordering and custody

Variation 2 of slide removed (Funding backends) · lens: Advanced · deck `fcv-e-membership-custody` page 20 · 4 steps · script 139 words, about 60 s

## Script

Threshold rules from the BDK and FROST architecture decision.

**[1]** The FROST signing threshold is exactly t, the BLS signature threshold; there is no separate custody threshold. Startup and activation fail closed on any other threshold or participant set.

**[2]** f, the tolerated number of faulty members, is floor of n minus 1 over 3. By default c is n minus f; t is at most c; production observation quorums q are at least c. For 7 members: f 2, c 5, t 3 to 5.

**[3]** Signing alone survives n minus t missing signers. An ordered spend needs c members to order and t to sign; the larger number sets availability. AlephBFT authorizes, BDK watches and builds, the FROST key manager holds share and nonces.

**[4]** Fewer than t members cannot spend, and no signer set can spend without an accepted transaction.

## Background

- **Fail closed**: on a mismatch the member refuses to start or activate instead of continuing with weaker settings.
- **f and BFT**: Byzantine fault tolerance means correct operation while up to f members behave arbitrarily. With f = ⌊(n − 1)/3⌋, n ≥ 3f + 1.
- **t ≥ f + 1**: required in production, so f faulty members cannot produce an ecash signature or a treasury signature alone.
- **Observation quorum q**: the number of matching member observations required before a payment or deposit counts. Production configs require q ≥ c.
- **Tolerated**: the table's last column, n − c, is the number of members that can be offline while a spend is still ordered and signed.
- **AlephBFT**: the consensus protocol that orders federation operations.
- **Watch-only BDK**: the Bitcoin Dev Kit wallet with public descriptors only. It indexes the chain, builds unsigned transactions (PSBTs) and broadcasts, but holds no private key.
- **FROST key manager**: the component in each member that stores the sealed root share and the nonce records and produces signature shares only for accepted transactions.

## Speaker note

- The slide writes "c = n − f". The code (`ThresholdParams::validate_bft_safety` in `crates/cdk-common/src/federation/config.rs`) requires c ≥ n − f; n − f is the default (`docs/federated-cashu-bdk-frost-architecture-decision.md`: "The existing BFT default is f = floor((n − 1)/3) and q = n − f"). The table uses the default. The script says "default".
- Notation: the architecture decision doc calls the consensus threshold q. On this slide c is the consensus threshold and q the payment observation quorum (code: `MemberQuorum { required }`, validated `required ≥ consensus_threshold`).
