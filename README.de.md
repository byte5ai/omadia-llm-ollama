<div align="center">

# @omadia/plugin-llm-ollama

### Betreibe dein ganzes omadia-Team lokal auf Ollama, ohne API-Key und ohne dass Daten die Maschine verlassen.

Der lokale, schlüssellose LLM-Provider für omadia. Modelle laufen auf der eigenen Hardware und kein Prompt-Token verlässt die Maschine, das ist die Basis für einen vollständig lokalen omadia-Workflow: Orchestrator, Sub-Agenten und Verifier alle auf lokalen Modellen.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Built for omadia](https://img.shields.io/badge/built%20for-omadia-2496ED.svg)](https://github.com/byte5ai/omadia)
[![TypeScript](https://img.shields.io/badge/built%20with-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[**Haupt-Repo**](https://github.com/byte5ai/omadia) · [**Website**](https://omadia.ai) · [**Plugin-Hub**](https://hub.omadia.ai) · [**Modelle**](#modelle) · [**Installation**](#installation)

🇬🇧 This guide is also available [in English](./README.md).

</div>

---

omadia ist ein selbst-hostbares agentisches OS: stelle Multi-Agent-Teams aus signierten Plugins zusammen, betreibe sie auf der eigenen Maschine und erhalte für jede Aktion eine nachvollziehbare Spur. Dieses Plugin macht Ollama zu einem der LLM-Provider, auf denen diese Agenten laufen, und hält dabei jeden Prompt auf lokaler Hardware. Haupt-Repo: [byte5ai/omadia](https://github.com/byte5ai/omadia).

## Modelle

| Modell | Klasse |
| --- | --- |
| `llama3.2:3b` | fast |
| `qwen3:4b` | fast |
| `llama3.1:8b` | balanced |
| `qwen3:8b` | balanced |
| `gpt-oss:20b` | frontier |
| `llama3.3:70b` | frontier |

Diese Modelle werden nicht automatisch geladen. Hole jedes gewünschte Modell zuerst mit `ollama pull <model>`, zum Beispiel `ollama pull llama3.1:8b`.

Agenten fragen eine Klasse an (`fast`, `balanced`, `frontier`). omadia bildet die Klasse auf das Modell ab, ein Agent nennt also nie ein festes Modell.

## So funktioniert es in omadia

Ein deklaratives Provider-Plugin. Das Manifest deklariert `policy.requires_api_key: false`, also veröffentlicht der Orchestrator auf einem omadia-Core, der schlüssellose Provider unterstützt, seinen Chat-Agenten ohne Vault-Key, und die Admin-UI blendet den Hinweis zur Drittanbieter-Verarbeitung aus, denn ein lokales Modell ist kein Drittanbieter-Verarbeiter. Auf älteren Cores trägst du einen beliebigen, nicht-leeren Platzhalter ins Key-Feld ein, da Ollama den `Authorization`-Header ignoriert.

Ollama liefert ein OpenAI-kompatibles Wire-Format unter `/v1`, also fährt omadia es über den eingebauten OpenAI-kompatiblen Adapter.

## Voraussetzungen

1. Installiere und starte Ollama. Der Daemon hört auf `http://localhost:11434`.
2. Lade mindestens ein Modell, zum Beispiel `ollama pull llama3.1:8b`.

## Installation

Für diesen Provider gibt es keinen API-Key. Du füllst nur die Setup-Felder unten aus. Weise dem Orchestrator zuerst einen LLM-Provider zu, danach können der Channel und weitere Agenten ihn nutzen.

1. Installiere über den [Plugin-Hub](https://hub.omadia.ai) in der omadia-Admin-UI (Store, Upload), oder lade das gebaute ZIP direkt hoch.
2. Lasse auf der Admin-Providers-Seite das API-Key-Feld leer oder setze einen Platzhalter.
3. Weise Ollama und ein Modell einem Agenten zu: dem Orchestrator, einem Sub-Agenten oder dem Verifier.

## Konfiguration

| Setup-Feld | Pflicht | Default | Hinweis |
| --- | :---: | --- | --- |
| `ollama_base_url` | nein | `http://localhost:11434/v1` | Im Container `http://host.docker.internal:11434/v1` nutzen, oder den Compose-Servicenamen `http://ollama:11434/v1`. |

Hinweis zum Kontext: Ollama liefert standardmäßig `num_ctx=4096`, unabhängig von der Fähigkeit eines Modells. Starte den Daemon mit `OLLAMA_CONTEXT_LENGTH=<n>` für größere agentische Prompts.

## Aus dem Quellcode bauen

```bash
npm install
npm run build   # tsc, schreibt dist/
npm test        # prüft manifest.yaml gegen die Core-Invarianten
```

`@omadia/plugin-api` und `@omadia/llm-provider` stellt der omadia-Host zur Laufzeit bereit (optionale Peer-Deps). Verlinke sie aus einem lokalen omadia-Checkout zum Bauen. Aufbau siehe [byte5ai/omadia](https://github.com/byte5ai/omadia).

## Lizenz

[MIT](LICENSE), byte5 GmbH