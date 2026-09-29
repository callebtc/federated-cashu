# 53.02 · The MUST behind each use

Variation 2 of slide 53 (What the specification covers) · lens: Advanced · deck `fcv-j-nutroot-use` page 12 · 3 steps · script 133 words, about 55 s

## Script

**[1]** Key forms and refunds. Bearer: a proof never carries both k and E. Pay to a key: one fresh ephemeral per output, and the payee verifies the tree is exactly the requested one. Multisig: an aggregated K carries at least the empty tweak, and two leaf keys with one x-coordinate reject. Refund: receivers evaluate every leaf against their policy.

**[2]** Leaf-based uses. HTLC: a protocol relying on publication checks that no claimant path avoids it, key path included. A witness revealing a commit leaf rejects. Auditable lock: u fresh per proof and disclosed. A v3 mint quote must carry a lock key.

**[3]** Protocol level. A v3 blind auth token without a valid witness rejects. Signing-package slots are only a hint. The mint returns witness and input digest for disclosure leaves, and otherwise must not.

## Background

- **MUST**: a normative requirement; an implementation that violates it is non-conforming.
- **Empty tweak**: t = tagged_hash("Cashu_NutrootTweak", K) with no root bytes. Cosigners of an aggregate key can then verify that no script path is hidden in it.
- **Same x-coordinate**: signatures are checked against the x-coordinate only, so 02‖x and 03‖x would be one signer counted twice toward n.
- **Claimant path**: any path the party who must publish could use instead. If the key path or a leaf without disclosure is available to that party, publication is not guaranteed.
- **u**: the NUMS offset in K = H + u·G; disclosing it proves no key path exists.
- **Quote lock (NUT-04)**: the `pubkey` field of a mint quote. On v3 the paid quote is a transaction input, and its lock key signs.
- **Blind auth token (NUT-22)**: a token for protected mint endpoints. It signs the request; intermediaries must relay the body byte for byte because the body hash is signed.
- **Signing-package slots**: the NUT-28 slot of each leaf key in a nutspA package. A wrong slot fails to match and the signer scans all slots.
- **Disclosure**: leaf field 0x0a, mode 0x01; makes the mint publish the exercised witness via NUT-07 and NUT-17.

## Speaker note

- The deck note says every rule is quoted from its NUT. The signing-package row is a description from NUT-10's transport-string section, not a MUST; the other rows are MUST or MUST NOT statements.
