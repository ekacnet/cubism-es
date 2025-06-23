# Generate demo/data/prom.json

This utility fetches a Prometheus range query and writes the response JSON to `demo/data/prom.json`.

## Files

- `demo/generate-prom-json.js`: Node.js generator for Prometheus range data
- `demo/update-demo-prom-json.sh`: convenience wrapper targeting `https://demo.promlabs.com`

## Generator Usage

```bash
node demo/generate-prom-json.js <prometheus_url> <query> [output_path] [duration_minutes] [step]
```

Examples:

```bash
node demo/generate-prom-json.js https://demo.promlabs.com demo_memory_usage_bytes
node demo/generate-prom-json.js https://demo.promlabs.com up /tmp/prom.json 30 15s
```

If `output_path` is omitted, JSON is printed to stdout.

## Demo Script Usage

From repo root:

```bash
./demo/update-demo-prom-json.sh
```

Defaults:

- endpoint: `https://demo.promlabs.com`
- query: `demo_memory_usage_bytes`
- output file: `demo/data/prom.json`
- range: `60` minutes
- step: `30s`

Override values:

```bash
./demo/update-demo-prom-json.sh '<query>' '<output_file>' '<duration_minutes>' '<step>'
```

Example:

```bash
./demo/update-demo-prom-json.sh 'up' 'demo/data/prom.json' '45' '15s'
```

## Exit Codes

- `0`: success
- `1`: invalid arguments
- `2`: request failed
