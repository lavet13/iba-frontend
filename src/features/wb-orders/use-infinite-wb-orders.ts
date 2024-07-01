import { WbOrdersQuery } from '../../gql/graphql';
import { graphql } from '../../gql';
import client from '../../graphql-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { InitialDataInfiniteOptions } from '../../utils/graphql/initial-data-infinite-options';

type TPageParam = {
  after: number | null;
};

export const useInfiniteWbOrders = (
  take = 30,
  options?: InitialDataInfiniteOptions<WbOrdersQuery, TPageParam>
) => {
  const wbOrders = graphql(`
    query WbOrders($input: WbOrdersInput!) {
      wbOrders(input: $input) {
        edges {
          id
          name
          phone
          qrCode
          orderCode
          wbPhone
          status
          createdAt
          updatedAt
        }
        pageInfo {
          endCursor
          hasNextPage

          startCursor
          hasPreviousPage
        }
      }
    }
  `);

  return useInfiniteQuery({
    queryKey: [(wbOrders.definitions[0] as any).name.value, { input: { take } }],
    queryFn: ({ pageParam }) => {
      return client.request(wbOrders, { input: { take, after: pageParam.after } });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.wbOrders.pageInfo.hasNextPage
        ? { after: lastPage.wbOrders.pageInfo.endCursor }
        : undefined;
    },
    initialPageParam: { after: null },
    ...options,
  });
};

