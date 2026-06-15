# @omadia/plugin-llm-ollama

Adds a local **[Ollama](https://ollama.com)** instance as an admin-selectable LLM provider for [omadia](https://github.com/byte5ai/omadia). Ollama exposes an OpenAI-compatible Chat Completions API on `/v1`, so this is a **declarative provider plugin**: the provider, its models and base URL are described in `manifest.yaml` and registered by the omadia kernel at load time — there is no runtime provider code to maintain.

The point of this plugin is a **fully local omadia workflow**: orchestrator, sub-agents and verifier can all run against models on your own hardware, so no token ever leaves the machine. Useful for data-protection-critical deployments (everything on-prem) and for end-to-end testing without cloud cost.

> Requires omadia core with the LLM-provider-plugin seam (the manifest-driven
> `LlmProviderCatalog`). Older cores ignore the `llm_provider` manifest block.

## Prerequisites

1. Install and run Ollama: <https://ollama.com> (the daemon listens on `http://localhost:11434`).
2. Pull at least one of the models below — they are **not** auto-pulled:

   ```bash
   ollama pull llama3.2:3b     # fast  (class default)
   ollama pull llama3.1:8b     # balanced (class default)
   ollama pull gpt-oss:20b     # frontier (class default)
   # optional alternatives:
   ollama pull qwen3:4b qwen3:8b llama3.3:70b
   ```

## Models

A curated starting set of tool-capable, locally runnable models. Extend it by adding any `ollama:<name>` entry your Ollama serves.

| Model | Class | Context\* | Max output | Vision |
|-------|-------|----------:|-----------:|:------:|
| `llama3.2:3b` (class default) | fast | 131,072 | 8,192 | no |
| `qwen3:4b` | fast | 32,768 | 8,192 | no |
| `llama3.1:8b` (class default) | balanced | 131,072 | 8,192 | no |
| `qwen3:8b` | balanced | 32,768 | 8,192 | no |
| `gpt-oss:20b` (class default) | frontier | 131,072 | 32,768 | no |
| `llama3.3:70b` | frontier | 131,072 | 16,384 | no |

\* **Context is a model capability, not what Ollama serves by default.** See the gotcha below.

## Install

1. Build the plugin: `npm install && npm run build` (produces `dist/plugin.js`). See [Development](#development) for resolving the `@omadia/*` peer types.
2. Package `manifest.yaml` + `dist/` and install it into omadia (admin → install plugin, or via the registry).
3. On the admin **Providers** page, **leave the API key blank** — Ollama needs no auth. (Set a key only if you front Ollama with a gateway/proxy that requires bearer auth; it is stored under `provider:ollama/api_key`.)
4. Assign **Ollama (local)** (and a model) to a plugin such as the orchestrator on the Providers page.

## Configuration

| Setup field | Required | Default | Notes |
|-------------|:--------:|---------|-------|
| `ollama_base_url` | no | `http://localhost:11434/v1` | Override when the middleware runs in a container or Ollama is remote. |

### Reaching Ollama from a containerized middleware

Set `ollama_base_url` depending on where Ollama runs:

- **Ollama as a service in the same compose stack** (recommended for a self-contained local omadia): `http://ollama:11434/v1` — `ollama` is the compose service DNS name.
- **Ollama on the host, middleware in Docker Desktop** (macOS/Windows): `http://host.docker.internal:11434/v1`.
- **Ollama on another machine**: the host's LAN IP, e.g. `http://192.168.1.10:11434/v1`.

For the daemon to accept non-localhost connections (host/LAN case), start it with `OLLAMA_HOST=0.0.0.0`.

## ⚠ Context-window gotcha (`num_ctx`)

Ollama serves a model with **`num_ctx=4096` by default**, regardless of the model's native context window. If you send more than that, Ollama silently truncates the prompt. To actually use the larger windows advertised above, either:

- start the daemon with `OLLAMA_CONTEXT_LENGTH=131072` (or your target), **or**
- bake `PARAMETER num_ctx 131072` into a custom Modelfile and `ollama create` from it.

Pick a value your hardware can hold in memory — larger contexts cost RAM/VRAM.

## Why no provider quirks

The `llm_provider` block declares **no quirks**: Ollama's `/v1` endpoint speaks the reference OpenAI Chat Completions shape. It accepts `max_tokens` (mapped internally to `num_predict`) and `tool_choice`, so omadia's built-in openai-compatible adapter drives it unmodified. Tool calling works with the tool-capable models listed above.

## No API key

Ollama is local and unauthenticated. omadia's credential resolver tolerates a missing/empty `provider:ollama/api_key` (it returns no key and sends no `Authorization` header), so the provider activates and serves requests with the Providers-page key left blank.

## Development

This plugin compiles against two omadia workspace packages declared as optional peer dependencies. They are not published to a registry, so link them from a local omadia checkout before building:

```bash
npm install
mkdir -p node_modules/@omadia
ln -sfn /path/to/omadia/middleware/packages/plugin-api  node_modules/@omadia/plugin-api
ln -sfn /path/to/omadia/middleware/packages/llm-provider node_modules/@omadia/llm-provider
npm run build   # tsc → dist/
npm test        # validates manifest.yaml against core's invariants
```

Only `@omadia/plugin-api` is needed to type-check `src/plugin.ts`; `@omadia/llm-provider` is listed for parity with the other provider plugins. The test suite (`test/manifest.test.ts`) needs neither — it validates `manifest.yaml` directly against the same invariants core enforces at load.

## License

MIT © byte5 GmbH
