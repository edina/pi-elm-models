# ELM models for Pi

A Pi coding-agent package that adds the University of Edinburgh ELM model provider. It currently includes the production Qwen 3.5 397B model with its 262,144-token context window.

## Requirements

- Pi coding agent 0.84.4 or later
- An ELM API key

## Install

Install the package globally:

```sh
pi install npm:pi-elm-models
```

Pi downloads the package from npm and updates its settings automatically. No GitHub checkout or manual model configuration is required.

## Add your ELM key

Run the package's secure login command:

```sh
pi-elm-models login
```

Paste your ELM key when prompted. Input is not echoed. The command preserves existing Pi credentials and stores the key in `~/.pi/agent/auth.json` with user-only permissions.

Alternatively, provide the key in the environment that launches Pi:

```sh
export ELM_API_KEY='your-key'
pi
```

Do not commit an API key to a repository.

## Select the model

Start Pi and run `/model`, then select:

```text
University of Edinburgh ELM / Qwen 3.5 397B
```

For command-line use:

```sh
pi --model 'elm/Qwen/Qwen3.5-397B-A17B-FP8'
```

## Update

The unversioned installation follows new releases. Update this package with:

```sh
pi update npm:pi-elm-models
```

Existing ELM credentials remain stored under the `elm` provider. Newly published models will appear after updating and restarting Pi.

## Project-local installation

To install the package only for the current project:

```sh
pi install npm:pi-elm-models --local
```

## Development

```sh
npm install
npm test
```

Test an unpublished checkout with:

```sh
pi -e ./dist/index.js --list-models elm
```

## License

MIT
