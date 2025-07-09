// This is how you safely access environment variables
export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  perplexity: {
    apiKey: process.env.SONAR_API_KEY,
  },
  redis: {
    url: process.env.REDIS_REST_URL,
    token: process.env.REDIS_REST_TOKEN,
  },
}

// Validation
if (!config.openai.apiKey) {
  throw new Error("OPENAI_API_KEY is required")
}

if (!config.perplexity.apiKey) {
  throw new Error("SONAR_API_KEY is required")
}
