const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

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
    throw new Error(`Prometheus error: ${response.data.error || 'unknown error'}`);
  }

  return response.data;
}

async function writeJsonFile(outputPath, payload) {
  const absolutePath = path.resolve(outputPath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return absolutePath;
}

(async () => {
  const prometheusUrl = process.argv[2];
  const query = process.argv[3];
  const outputPath = process.argv[4];
  const durationMinutes = Number.parseInt(process.argv[5] || '60', 10);
  const step = process.argv[6] || '30s';

  if (!prometheusUrl || !query) {
    console.error(
      'Usage: node generate-prom-json.js <prometheus_url> <query> [output_path] [duration_minutes] [step]'
    );
    process.exit(1);
  }

  if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
    console.error('duration_minutes must be a positive integer');
    process.exit(1);
  }

  try {
    const result = await queryRangePrometheus(
      prometheusUrl,
      query,
      durationMinutes,
      step
    );

    if (outputPath) {
      const writtenPath = await writeJsonFile(outputPath, result);
      console.log(`Wrote ${writtenPath}`);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Failed to generate prom.json:', error.message);
    process.exit(2);
  }
})();
