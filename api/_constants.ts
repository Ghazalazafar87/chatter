export const SUPPORTED_MODELS = [
  {
    id: 'gemini-flash-lite-latest',
    name: 'Gemini Flash Lite (Ultra Fast)',
    badge: '⚡ Lowest Latency • 1.4s TTFT',
    speed: 'Instantaneous',
    description: 'Fastest response engine tuned for instant completions and low latency.',
    isDefault: true,
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    badge: 'High Throughput',
    speed: 'High Speed',
    description: 'Balanced speed and context reasoning with high free-tier availability.',
    isDefault: false,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Lightweight',
    speed: 'Fast',
    description: 'Compact reasoning model for developer and code questions.',
    isDefault: false,
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    badge: 'Continuous Release',
    speed: 'Standard',
    description: 'Standard flash model with large context reasoning.',
    isDefault: false,
  },
];

export function parseCleanErrorMessage(rawError: any): string {
  if (!rawError) return 'An unexpected error occurred. Please try again.';

  let msg = typeof rawError === 'string' ? rawError : rawError.message || String(rawError);

  try {
    const parsed = JSON.parse(msg);
    if (parsed.error?.message) {
      try {
        const doubleParsed = JSON.parse(parsed.error.message);
        if (doubleParsed.error?.message) {
          msg = doubleParsed.error.message;
        } else {
          msg = parsed.error.message;
        }
      } catch {
        msg = parsed.error.message;
      }
    }
  } catch {
    // Not valid JSON, keep msg as is
  }

  if (
    msg.includes('high demand') ||
    msg.includes('UNAVAILABLE') ||
    rawError?.code === 503 ||
    rawError?.status === 503
  ) {
    return 'The model experienced a temporary demand spike on Google servers. Please try again or switch to Gemini Flash Lite.';
  }

  if (
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    rawError?.code === 429 ||
    rawError?.status === 429
  ) {
    return 'Free tier rate limit reached (15 RPM or daily quota). Please pause for 5 seconds before retrying.';
  }

  return msg.replace(/\n+/g, ' ').trim();
}
