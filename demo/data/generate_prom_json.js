const axios = require('axios');
const fs = require('fs');
const path = require('path');

function toUnixTime(date) {
  return Math.floor(date.getTime() / 1000);
}

async function queryRangePrometheus(
  prometheusUrl,
  query,
  durationMinutes = 60,
  step = '30s'
) {
  const now = new Date();
  const end = toUnixTime(now);
  const start = toUnixTime(
    new Date(now.getTime() - durationMinutes * 60 * 1000)
  );

  const url = `${prometheusUrl}/api/v1/query_range`;

  const response = await axios.get(url, {
    params: {
      query,
      start,
      end,
      step,
    },
  });

  if (response.data.status !== 'success') {
    throw new Error(`Prometheus error: ${response.data.error}`);
  }

  return response.data;
}

function printRangeResults(data) {
  const result = data.data;

  if (result.resultType !== 'matrix') {
    console.error(`Unsupported result type: ${result.resultType}`);
    return;
  }

  for (const series of result.result) {
    const labels = series.metric;
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(', ');

    console.log(`\nSeries: {${labelStr}}`);
    for (const [timestamp, value] of series.values) {
      const ts = new Date(timestamp * 1000).toISOString();
      console.log(`  ${ts} => ${value}`);
    }
  }
}

function saveToFile(data, filename) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 Saved to: ${filename}`);
}

// CLI entry
(async () => {
  const args = process.argv.slice(2);
  const prometheusUrl = args[0];
  const query = args[1];
  const outIdx = args.indexOf('--out');
  const outFile =
    outIdx !== -1
      ? args[outIdx + 1] || `prometheus_dump_${Date.now()}.json`
      : null;

  if (!prometheusUrl || !query) {
    console.error(
      'Usage: node query-prometheus-range.js <prometheus_url> <query> [--out output.json]'
    );
    process.exit(1);
  }

  try {
    const rawData = await queryRangePrometheus(prometheusUrl, query, 60, '30s');

    if (outFile) {
      saveToFile(rawData, outFile);
    }
  } catch (err) {
    console.error('❌ Query failed:', err.message);
    process.exit(2);
  }
})();
