#!/usr/bin/env node

import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { ELM_PROVIDER_ID } from './index.js';

type AuthFile = Record<string, unknown>;

function agentDirectory(): string {
  return process.env.PI_CODING_AGENT_DIR?.trim() || join(homedir(), '.pi', 'agent');
}

async function readAuthFile(path: string): Promise<AuthFile> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('the root value is not an object');
    }
    return parsed as AuthFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw new Error(`Could not read ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function promptForKey(): Promise<string> {
  const fromEnvironment = process.env.ELM_API_KEY?.trim();
  if (fromEnvironment) return fromEnvironment;

  if (!process.stdin.isTTY) {
    throw new Error('No interactive terminal. Set ELM_API_KEY and run this command again.');
  }

  process.stderr.write('ELM API key: ');
  process.stdin.setEncoding('utf8');
  process.stdin.setRawMode(true);
  process.stdin.resume();

  return new Promise((resolve, reject) => {
    let value = '';

    const finish = (error?: Error) => {
      process.stdin.off('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stderr.write('\n');
      if (error) reject(error);
      else resolve(value.trim());
    };

    const onData = (input: string) => {
      for (const character of input) {
        if (character === '\u0003') {
          finish(new Error('Cancelled'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          return;
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
          continue;
        }
        value += character;
      }
    };

    process.stdin.on('data', onData);
  });
}

export async function saveElmKey(key: string, directory = agentDirectory()): Promise<string> {
  const trimmed = key.trim();
  if (!trimmed) throw new Error('ELM API key cannot be empty.');

  const authPath = join(directory, 'auth.json');
  const auth = await readAuthFile(authPath);
  auth[ELM_PROVIDER_ID] = { type: 'api_key', key: trimmed };

  await mkdir(dirname(authPath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${authPath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(auth, null, 2)}\n`, { mode: 0o600 });
  await chmod(temporaryPath, 0o600);
  await rename(temporaryPath, authPath);
  await chmod(authPath, 0o600);
  return authPath;
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command !== 'login') {
    process.stdout.write('Usage: pi-elm-models login\n');
    process.exitCode = command ? 1 : 0;
    return;
  }

  const key = await promptForKey();
  const authPath = await saveElmKey(key);
  process.stdout.write(`ELM API key saved securely in ${authPath}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
