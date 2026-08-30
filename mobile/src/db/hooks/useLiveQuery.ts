/**
 * db/hooks/useLiveQuery.ts — Hook reactivo para consultas SQLite.
 *
 * Drizzle ORM no tiene un built-in reactivo para SQLite nativo.
 * Este hook implementa un patrón de polling simple:
 * 1. Ejecuta la query al montar
 * 2. Re-ejecuta cuando cambian los dependencies
 * 3. Expone un método `refresh()` para re-ejecutar manualmente
 *
 * Para cambios en tiempo real (insert/update desde otro screen),
 * llamar `refresh()` después de cada operación de escritura.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {getDatabase} from '../database';

interface UseLiveQueryResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Ejecuta una query Drizzle y re-actualiza los datos cuando cambian
 * los dependencies o cuando se llama `refresh()`.
 *
 * @example
 * ```tsx
 * const { data: fundos, loading } = useLiveQuery(
 *   (db) => db.select().from(fundos),
 *   []
 * );
 * ```
 */
export function useLiveQuery<T>(
  queryFn: (db: ReturnType<typeof getDatabase>) => Promise<T[]>,
  dependencies: unknown[] = [],
): UseLiveQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const db = getDatabase();
      const result = await queryFn(db);
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
    };
  }, [execute]);

  return {data, loading, error, refresh: execute};
}
