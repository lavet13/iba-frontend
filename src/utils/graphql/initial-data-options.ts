import { QueryKey, UndefinedInitialDataOptions } from '@tanstack/react-query';

export type InitialDataOptions<TQueryFnData> = Omit<
  UndefinedInitialDataOptions<TQueryFnData, Error, TQueryFnData, QueryKey>,
  'queryKey' | 'queryFn'
>;
