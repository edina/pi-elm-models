import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { saveElmKey } from '../dist/cli.js';

test('stores the ELM key securely and preserves other credentials', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pi-elm-models-'));
  const authPath = join(directory, 'auth.json');
  await writeFile(
    authPath,
    `${JSON.stringify({ existing: { type: 'api_key', key: 'keep-me' } }, null, 2)}\n`,
  );

  assert.equal(await saveElmKey('  test-elm-key  ', directory), authPath);

  const auth = JSON.parse(await readFile(authPath, 'utf8'));
  assert.deepEqual(auth.existing, { type: 'api_key', key: 'keep-me' });
  assert.deepEqual(auth.elm, { type: 'api_key', key: 'test-elm-key' });
  assert.equal((await stat(authPath)).mode & 0o777, 0o600);
});

test('rejects an empty ELM key', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pi-elm-models-'));
  await assert.rejects(saveElmKey('   ', directory), /cannot be empty/);
});
