export const fetcher = (url: string, { arg }: { arg: any }) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  }).then(async (r) => {
    const data = await r.json()
    if (!r.ok) {
      throw new Error(data.error || `Error ${r.status}`)
    }
    return data
  })
