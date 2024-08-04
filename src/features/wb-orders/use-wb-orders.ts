import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { graphql } from '../../gql';
import { WbOrdersQuery } from '../../gql/graphql';
import { InitialDataOptions } from '../../utils/graphql/initial-data-options';
import { client } from '../../graphql-client';

type UseWbOrdersProps = {
  take?: number;
  before?: number | null;
  after?: number | null;
};

export const useWbOrders = (
  { take, after, before }: UseWbOrdersProps,
  options?: InitialDataOptions<WbOrdersQuery>
) => {
  const input: Record<string, any> = {};
  import.meta.env.DEV && console.log({ before, after });

  if (after !== null && after !== undefined) {
    input.after = after;
  }
  if (before !== null && before !== undefined) {
    input.before = before;
  }
  if (take !== undefined && take !== null) {
    input.take = take;
  }
  import.meta.env.DEV && console.log({ input });

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

  return useQuery({
    queryKey: [(wbOrders.definitions[0] as any).name.value, { input }],
    queryFn: async () => {
      // await new Promise(resolve => setTimeout(() => resolve(0), 10000000));
      return await client.request(wbOrders, { input });
    },
    placeholderData: keepPreviousData,
    ...options,
  });
};
