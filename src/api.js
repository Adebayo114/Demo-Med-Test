    const API_KEY = "ak_e398afac39a8ba3fb771d0559cc2384256af26cd5df067b4";
    const BASE_URL = "https://assessment.ksensetech.com/api";

export async function fetchWithRetry(url, retries = 5, delay = 1000) {
  try {
    const res = await fetch(url, {
      headers: { "x-api-key": API_KEY },
    });

    if (!res.ok) {
      if ([429, 500, 502, 503].includes(res.status)) {
        throw new Error(`Retryable ${res.status}`);
      }
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (retries === 0) {
      console.error("Out of retries for:", url);
      throw err;
    }

    console.warn(
      `Retrying ${url} in ${delay}ms (${retries} left)`
    );

    await new Promise(r => setTimeout(r, delay));

    // exponential backoff
    return fetchWithRetry(url, retries - 1, delay * 2);
  }
}


export async function fetchAllPatients() {
  let page = 1;
  const patients = [];

  while (true) {
    console.log("Fetching page", page);

    const res = await fetchWithRetry(
      `${BASE_URL}/patients?page=${page}`
    );

    patients.push(...res.data);

    if (!res.pagination?.hasNext) break;

    page++;

    // small delay to avoid 429
    await new Promise(r => setTimeout(r, 300));
  }

  return patients;
}


    export async function submitResults(payload) {
    const res = await fetch(`${BASE_URL}/submit-assessment`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        },
        body: JSON.stringify(payload),
    });

    return res.json();
    }
