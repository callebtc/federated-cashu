# 28.07 · Where the key material lives

Variation 7 of slide 28 (Two DKG ceremonies, one roster) · lens: Explained via code · deck `fcv-e-membership-custody` page 33 · 3 steps · script 133 words, about 55 s

## Script

The FROST side of setup is one struct in cdk-common, frost_dkg.rs.

FederationFrostDkgContext holds federation ID, ceremony ID, setup authorization, root key epoch, protocol version 2, the ciphersuite secp256k1_sha256_tr_v1, threshold and participants.

**[1]** Five fields come from the BLS setup: federation ID, the shared ceremony ID, setup authorization, threshold equal to signature_threshold, and participants equal to the roster. validate_against checks them against the config; the dual result check covers the ceremony ID. dkg_driver.rs drives both ceremonies, and activation needs both results.

**[2]** cdk-frost holds the root package, sealed share, application registration, additive derivation, nonce store and signing. It contains no BDK, network, mint, consensus or transport code.

**[3]** Bitcoin specifics live in cdk-frost-bip32, Bark VTXO keys in cdk-frost-bark, each as its own application on the same root. No production function reconstructs the root or exports a share.

## Background

- **Ceremony ID**: an identifier derived from the setup and proposal hash, shared by the BLS and FROST ceremonies of one setup.
- **Root key epoch**: a version number of the FROST root; a new root ceremony would use a new epoch.
- **Protocol version 2**: the version of CDK's canonical FROST DKG conversion. Any other value is rejected.
- **FederationDualDkgResult**: the pair of one member's BLS and FROST results, required together for activation.
- **Additive derivation**: deriving child keys by adding public scalars to the root share and root public key.
- **VTXO**: virtual transaction output, the unit of value in the Ark protocol that Bark implements.
- **Crate boundary**: cdk-frost is application-neutral. Bitcoin descriptors and BIP32 rules live only in cdk-frost-bip32; Bark rules only in cdk-frost-bark.

## Speaker note

- The code box highlights `ceremony_id` together with `validate_against(config) // all of the above`. `validate_against` (`crates/cdk-common/src/federation/frost_dkg.rs`) compares federation ID, setup authorization, threshold and participants with the config, and protocol and ciphersuite; it does not compare the ceremony ID, which is not in the config. `FederationDualDkgResult::validate` compares the BLS and FROST ceremony IDs. The script says this.
