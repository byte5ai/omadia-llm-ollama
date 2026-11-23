# Changelog

## 0.2.1

- Changed: user-visible texts (manifest description and playbook, READMEs) no longer say "Orchestrator" (spec 2042 §6 criterion 12, `docs/terminology.md`); they speak of agents, internal helpers and the verifier. No behaviour change.

## 0.2.0

- Changed: `identity.kind` is now `model` (was `extension`). This is a model plugin; only the kernel's model gateway calls it (spec 2042, byte5ai/omadia#2053).
- Changed: `compat.core` is `>=1.78.0 <2.0` (the `model` kind needs a kernel that knows it).
- Added: `$config.<base_url_field>` in `permissions.network.outbound`, so an operator-set base URL host is allowed next to the literal default host(s).
- Unchanged: plugin id, `llm_provider` block, credentials.
