/**
 * @omadia/plugin-llm-ollama — entry point.
 *
 * Ollama exposes an OpenAI-compatible Chat Completions API on `/v1`, so this
 * provider needs NO runtime provider code: the kernel reads the `llm_provider`
 * block from this plugin's `manifest.yaml` at manifest-load time and registers
 * Ollama (id, baseURL, models) into the kernel-owned `LlmProviderCatalog` BEFORE
 * any plugin activates. That ordering is what lets the orchestrator resolve the
 * Ollama provider at its own activation regardless of plugin load order.
 *
 * `activate()` therefore only performs an optional sanity log — the provider is
 * already live by the time we get here. Ollama runs locally and needs no API
 * key: the orchestrator tolerates an empty `provider:ollama/api_key` vault entry
 * and sends no Authorization header. The operator only needs a running Ollama
 * daemon with the desired models pulled (`ollama pull <model>`); the base URL is
 * configurable via the manifest setup field `ollama_base_url`.
 */
import type { PluginContext } from '@omadia/plugin-api';

export interface OllamaPluginHandle {
  close(): Promise<void>;
}

export async function activate(
  ctx: PluginContext,
): Promise<OllamaPluginHandle> {
  ctx.log(
    '[plugin-llm-ollama] active — local Ollama provider declared in manifest; ' +
      'ensure the Ollama daemon is running and models are pulled ' +
      '(ollama pull <model>). No API key required.',
  );
  return {
    async close(): Promise<void> {
      ctx.log('[plugin-llm-ollama] deactivating');
    },
  };
}
