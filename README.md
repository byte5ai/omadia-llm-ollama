# @omadia/plugin-llm-ollama

Runs a local [Ollama](https://ollama.com) as an LLM provider for omadia, with no API key. Your models run on your own hardware, so no prompt token leaves the machine. This is the basis for a fully local omadia workflow: orchestrator, sub-agents, and verifier all on local models.

omadia is a self-hostable agentic OS: you build, run, and audit multi-agent AI teams from signed plugins, and you bring your own LLM (or run it locally). Main repo: [byte5ai/omadia](https://github.com/byte5ai/omadia).

## Models

A starting set of tool-capable, locally runnable models. They are not auto-pulled. Run `ollama pull <model>` for each one you want, and add any other `ollama:<name>` your daemon serves.

| Model | Class |
|-------|-------|
| `llama3.2:3b` | fast |
| `qwen3:4b` | fast |
| `llama3.1:8b` | balanced |
| `qwen3:8b` | balanced |
| `gpt-oss:20b` | frontier |
| `llama3.3:70b` | frontier |

## How it works in omadia

This is a declarative provider, so it ships no runtime provider code. The `llm_provider` block in `manifest.yaml` (id, base URL, models, policy) is read by the omadia kernel when the plugin loads, before any agent activates, and registered into the kernel's provider catalog. Ollama serves an OpenAI-compatible Chat Completions API on `/v1`, so omadia's built-in OpenAI-compatible adapter drives the calls.

The manifest declares `policy.requires_api_key: false`, so on an omadia core that supports keyless providers the orchestrator publishes its chat agent without a vault key and the admin UI drops the third-party-processing note (a local model is not a third-party processor). On older cores, leave any non-empty placeholder in the key field, since Ollama ignores the `Authorization` header.

## Prerequisites

1. Install and run Ollama (the daemon listens on `http://localhost:11434`).
2. Pull at least one model, for example `ollama pull llama3.1:8b`.

## Install

Install from the omadia hub at [hub.omadia.ai](https://hub.omadia.ai) (omadia admin, plugins, install), or upload the built ZIP directly. On the admin Providers page, leave the API key blank (or a placeholder), then assign Ollama and a model to an agent.

## Configuration

| Setup field | Required | Default | Notes |
|-------------|:--------:|---------|-------|
| `ollama_base_url` | no | `http://localhost:11434/v1` | In a container, use `http://host.docker.internal:11434/v1`, or the compose service name (`http://ollama:11434/v1`). |

Context note: Ollama serves `num_ctx=4096` by default regardless of a model's capability. Start the daemon with `OLLAMA_CONTEXT_LENGTH=<n>` to use a larger window for agentic prompts.

## Build from source

```bash
npm install
npm run build   # tsc, emits dist/
npm test        # validates manifest.yaml against core's invariants
```

The plugin compiles against omadia workspace packages (`@omadia/plugin-api`, `@omadia/llm-provider`), declared as optional peer deps. Link them from a local omadia checkout before building. See [byte5ai/omadia](https://github.com/byte5ai/omadia).

## License

MIT, byte5 GmbH
