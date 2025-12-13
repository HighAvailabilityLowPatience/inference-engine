// telemetry-watch/src/services/api.ts

/**
 * Determine backend URL based on environment.
 * When running inside Docker Compose, the backend service name is `ml-backend`.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://ml-backend:8000";

/**
 * Hit the FastAPI /predict endpoint
 */
async function predict(payload: any) {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Predict failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Hit the FastAPI /health endpoint
 */
async function health() {
  const res = await fetch(`${API_BASE_URL}/health`);

  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Export the object your components expect
*/
/**
 * Hit the FastAPI /quick-sentiment endpoint
 */
async function quickSentiment(text: string) {
  const res = await fetch(`${API_BASE_URL}/quick-sentiment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(`Quick Sentiment failed: ${res.status}`);
  }

  return res.json();
}

export const apiService = {
  predict,
  health,
  quickSentiment,
};

/**
 * (Optional) also export the individual functions,
 * in case any code relies on direct imports.
 */
export { predict, health, quickSentiment };
