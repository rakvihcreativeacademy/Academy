/** Bound upstream requests so a connection failure cannot leave admin controls pending indefinitely. */
export const supabaseFetch: typeof fetch = (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const timeout = AbortSignal.timeout(url.includes('/storage/v1/') ? 60000 : 20000);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
};
