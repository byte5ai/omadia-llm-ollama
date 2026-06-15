/**
 * Validates manifest.yaml's `llm_provider` block against the same invariants
 * the omadia core model registry enforces (see middleware's
 * `parseLlmProviderManifestBlock` + `registerExternalModels`), so the plugin
 * can't ship a manifest core would reject at load.
 *
 * Note: unlike cloud providers, Ollama is local and uses an `http://localhost`
 * base URL — core performs NO https-scheme check, so this test accepts http too.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { parse } from 'yaml';

const manifestPath = fileURLToPath(new URL('../manifest.yaml', import.meta.url));
const manifest = parse(readFileSync(manifestPath, 'utf8')) as Record<
  string,
  unknown
>;

interface ModelEntry {
  id: string;
  model_id: string;
  label: string;
  class: 'fast' | 'balanced' | 'frontier';
  max_tokens: number;
  context_window: number;
  vision: boolean;
  class_default?: boolean;
}

interface LlmProviderBlock {
  id: string;
  label: string;
  wire_format: string;
  default_base_url: string;
  base_url_config_key?: string;
  quirks?: Record<string, unknown>;
  models: ModelEntry[];
}

function block(): LlmProviderBlock {
  return manifest['llm_provider'] as LlmProviderBlock;
}

test('manifest declares the ollama llm_provider block', () => {
  const p = block();
  assert.equal(p.id, 'ollama');
  assert.equal(p.wire_format, 'openai-compatible');
  assert.ok(Array.isArray(p.models) && p.models.length > 0);
});

test('base URL is a valid http(s) URL and config key is set', () => {
  const p = block();
  // Local Ollama uses http://localhost — accept http or https, reject nonsense.
  const url = new URL(p.default_base_url);
  assert.ok(
    url.protocol === 'http:' || url.protocol === 'https:',
    `unexpected protocol '${url.protocol}'`,
  );
  // Operators must be able to repoint the daemon (e.g. host.docker.internal).
  assert.equal(p.base_url_config_key, 'ollama_base_url');
});

test('every model id equals "<provider>:<model_id>"', () => {
  const p = block();
  for (const m of p.models) {
    assert.equal(
      m.id,
      `${p.id}:${m.model_id}`,
      `model id '${m.id}' must equal '${p.id}:${m.model_id}'`,
    );
  }
});

test('model classes are valid and ids/model_ids are not class refs', () => {
  const p = block();
  const valid = new Set(['fast', 'balanced', 'frontier']);
  for (const m of p.models) {
    assert.ok(valid.has(m.class), `invalid class '${m.class}' for ${m.id}`);
    assert.ok(!m.id.startsWith('class:'), `id may not start with class: (${m.id})`);
    assert.ok(typeof m.max_tokens === 'number' && m.max_tokens > 0);
    assert.ok(typeof m.context_window === 'number' && m.context_window > 0);
    assert.ok(m.max_tokens <= m.context_window, `${m.id}: max_tokens > context_window`);
  }
});

test('each class has exactly one default when it has >1 model', () => {
  const p = block();
  const counts = new Map<string, { total: number; defaults: number }>();
  for (const m of p.models) {
    const c = counts.get(m.class) ?? { total: 0, defaults: 0 };
    c.total += 1;
    if (m.class_default === true) c.defaults += 1;
    counts.set(m.class, c);
  }
  for (const [cls, c] of counts) {
    if (c.total > 1) {
      assert.equal(c.defaults, 1, `class '${cls}' needs exactly one class_default`);
    }
  }
});

test('model ids are unique', () => {
  const p = block();
  const ids = p.models.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate model id');
});

test('covers all three model classes for a full local workflow', () => {
  const p = block();
  const classes = new Set(p.models.map((m) => m.class));
  for (const cls of ['fast', 'balanced', 'frontier']) {
    assert.ok(classes.has(cls), `missing a '${cls}' model`);
  }
});
