const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const mockResponse = async <T>(data: T, latency = 200) => {
  await delay(latency);
  return { data };
};

