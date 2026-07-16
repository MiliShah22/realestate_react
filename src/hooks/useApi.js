import { useState, useEffect, useCallback, useRef } from 'react';
import { gql } from '../lib/gqlClient.js';

/**
 * Generic data-fetching hook.
 * Usage:
 *   const { data, loading, error, refetch } = useApi(QUERY, variables, { skip: !user });
 *
 * - Automatically aborts in-flight requests on unmount or variable change.
 * - Exposes `refetch()` to manually re-run the query.
 * - `skip: true` prevents the query from running (useful when waiting for auth).
 */
export function useApi(query, variables = {}, { skip = false } = {}) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError]     = useState(null);
  const abortRef = useRef(null);

  const run = useCallback(async (vars = variables) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await gql(query, vars, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (e.name !== 'AbortError') setError(e);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [query, JSON.stringify(variables)]); // eslint-disable-line

  useEffect(() => {
    if (!skip) run();
    return () => abortRef.current?.abort();
  }, [skip, run]);

  return { data, loading, error, refetch: run };
}

/**
 * Lazy mutation hook — returns a function you call manually.
 * Usage:
 *   const [doLogin, { loading, error }] = useMutation(LOGIN_MUTATION);
 *   const result = await doLogin({ email, password, role });
 */
export function useMutation(query) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const mutate = useCallback(async (variables = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await gql(query, variables);
      return result;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [query]);

  return [mutate, { loading, error }];
}
