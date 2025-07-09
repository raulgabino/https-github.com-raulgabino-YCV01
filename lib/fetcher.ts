export const fetcher = (url: string, options?: RequestInit) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  }).then((r) => r.json())
