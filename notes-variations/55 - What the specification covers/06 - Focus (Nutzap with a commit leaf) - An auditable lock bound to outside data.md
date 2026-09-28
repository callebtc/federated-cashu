# 55.06 · An auditable lock bound to outside data

Variation 6 of slide 55 (What the specification covers) · lens: Focus: Nutzap with a commit leaf · deck `fcv-j-nutroot-use` page 16 · 6 steps · script 140 words, about 60 s

## Script

**[1]** The sender picks a fresh u, here 7. K = H + u·G has no key path.

**[2]** One threshold leaf: n = 1, key 3, disclosure mode 0x01, the key not blinded. 46 bytes.

**[3]** A commit leaf fixes 32 bytes, here SHA-256 of "external data". In a Nutzap it is a digest of the Nostr event the payment is for. 37 bytes.

**[4]** The two leaf hashes are sorted and paired into the root, 14147412…. The tweak from K and the root gives the secret, 0217b907….

**[5]** Anyone with the spend info checks K − u·G = H and recomputes the secret. Only key 3 can spend.

**[6]** Key 3's script-path witness reveals the threshold leaf, K and one sibling hash, the commit leaf's. Because of disclosure, the mint publishes this witness and its input digest. A witness revealing the commit leaf rejects.

## Background

- **Nutzap**: ecash sent over Nostr to a recipient's key. A commit leaf binds the proof to one event, so it cannot be reused for another.
- **Commit leaf**: type 0x04 with one 32-byte hash field. It is never a spend path; the mint sees it only as a sibling hash.
- **NUMS offset**: H has no known private key, so K = H + u·G has none either; disclosing u lets anyone check that.
- **Sorted pair**: root = tagged_hash("Cashu_NutrootBranch", smaller hash ‖ larger hash); here the commit hash 20cccc22… comes before the threshold hash b957f8b5….
- **Disclosure**: the mint publishes the exact witness and input digest through NUT-07 checkstate and NUT-17 subscriptions, so third parties can verify key 3's signature.
- **Why only key 3**: check one over K, u and the tree shows the secret commits exactly these two leaves and no key path; the commit leaf grants no one spend power.

## Speaker note

- NUT-10's canonical auditable lock has exactly one threshold leaf; this page is the tests/10-tests.md commit-leaf vector, "the auditable lock … with a commit leaf beside it". The "only key 3" conclusion still holds, because the commit leaf is no spend path.
- u = 7 is fixed for the vector; a real send uses a fresh u.
