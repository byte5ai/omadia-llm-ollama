<div align="center">

# @omadia/plugin-llm-ollama

### Run your whole omadia team locally on Ollama, with no API key and no data leaving the machine.

The local, keyless LLM provider for omadia. Models run on your own hardware and no prompt token leaves the machine, so this is the basis for a fully local omadia workflow: orchestrator, sub-agents, and verifier all on local models.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Built for omadia](https://img.shields.io/badge/built%20for-omadia-2496ED.svg)](https://github.com/byte5ai/omadia)
[![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[**Main repo**](https://github.com/byte5ai/omadia) · [**Website**](https://omadia.ai) · [**Plugin hub**](https://hub.omadia.ai) · [**Models**](#models) · [**Install**](#install)

🇩🇪 Diese Anleitung gibt es auch [auf Deutsch](./README.de.md).

</div>

---

omadia is a self-hostable agentic OS: compose multi-agent teams from signed plugins, run them on your own machine, and get an auditable trail for every action. This plugin makes Ollama one of the LLM providers those agents can run on, keeping every prompt on local hardware. Main repo: [byte5ai/omadia](https://github.com/byte5ai/omadia).

## Models

| Model | Class |
| --- | --- |
| `llama3.2:3b` | fast |
| `qwen3:4b` | fast |
| `llama3.1:8b` | balanced |
| `qwen3:8b` | balanced |
| `gpt-oss:20b` | frontier |
| `llama3.3:70b` | frontier |

These models are not auto-pulled. Fetch each one you want with `ollama pull <model>` first, for example `ollama pull llama3.1:8b`.

Agents ask for a class (`fast`, `balanced`, `frontier`). omadia maps the class to the model, so an agent never hard-codes one.

## How it works in omadia

A declarative provider plugin. The manifest declares `policy.requires_api_key: false`, so on an omadia core that supports keyless providers the orchestrator publishes its chat agent without a vault key, and the admin UI drops the third-party-processing note, because a local model is not a third-party processor. On older cores, leave any non-empty placeholder in the key field, since Ollama ignores the `Authorization` header.

Ollama serves an OpenAI-compatible wire format under `/v1`, so omadia drives it through its built-in OpenAI-compatible adapter.

## Prerequisites

1. Install and run Ollama. The daemon listens on `http://localhost:11434`.
2. Pull at least one model, for example `ollama pull llama3.1:8b`.

## Install

There is no API key for this provider. You just fill the setup fields below. Assign an LLM provider to the orchestrator first, then the channel and other agents can use it.

1. Install from the [plugin hub](https://hub.omadia.ai) in the omadia admin UI (Store, Upload), or drop the built ZIP in directly.
2. On the admin Providers page, leave the API key blank or set a placeholder.
3. Assign Ollama and a model to an agent: the orchestrator, a sub-agent, or the verifier.

## Configuration

| Setup field | Required | Default | Notes |
| --- | :---: | --- | --- |
| `ollama_base_url` | no | `http://localhost:11434/v1` | In a container use `http://host.docker.internal:11434/v1`, or the compose service name `http://ollama:11434/v1`. |

Context note: Ollama serves `num_ctx=4096` by default, regardless of a model's capability. Start the daemon with `OLLAMA_CONTEXT_LENGTH=<n>` for larger agentic prompts.

## Build from source

```bash
npm install
npm run build   # tsc, emits dist/
npm test        # validates manifest.yaml against core's invariants
```

`@omadia/plugin-api` and `@omadia/llm-provider` are provided by the omadia host at runtime (optional peer deps). Link them from a local omadia checkout to build. See [byte5ai/omadia](https://github.com/byte5ai/omadia) for the layout.

## License

[MIT](LICENSE), byte5 GmbH