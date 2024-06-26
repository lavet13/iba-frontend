import { UndefinedInitialDataInfiniteOptions, InfiniteData, QueryKey } from "@tanstack/react-query";

export type InitialDataInfiniteOptions<TQueryFnData, TPageParam> = Omit<
  UndefinedInitialDataInfiniteOptions<TQueryFnData, Error, InfiniteData<TQueryFnData, TPageParam>, QueryKey, TPageParam>,
  'queryKey' | 'queryFn'
>;
