import { graphql } from '../../gql';
import { WbOrderByIdQuery } from '../../gql/graphql';
import client from '../../graphql-client';
import { InitialDataOptions } from '../../utils/graphql/initial-data-options';
import { ConsoleLog } from '../../utils/debug/console-log';
import { useQuery } from '@tanstack/react-query';

export const useWbOrderById = (id: string, options?: InitialDataOptions<WbOrderByIdQuery>) => {
  const wbOrderById = graphql(`
    query WbOrderById($id: BigInt!) {
      wbOrderById(id: $id) {
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
    }
  `);

  return useQuery<WbOrderByIdQuery>({
    queryKey: [(wbOrderById.definitions[0] as any).name.value, { id }],
    queryFn: async ({ queryKey }) => {
      ConsoleLog({ what: queryKey });
      return client.request({
        document: wbOrderById,
        variables: { id },
      });
    },
    ...options,
  });
};


