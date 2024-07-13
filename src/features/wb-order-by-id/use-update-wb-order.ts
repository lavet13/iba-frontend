import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  UpdateWbOrderMutation,
  UpdateWbOrderMutationVariables,
  WbOrderByIdQuery,
  WbOrdersQuery,
} from '../../gql/graphql';
import { graphql } from '../../gql';
import { client } from '../../graphql-client';
import queryClient from '../../react-query/query-client';

export const useUpdateWbOrder = (
  options?: UseMutationOptions<
    UpdateWbOrderMutation,
    Error,
    UpdateWbOrderMutationVariables
  >
) => {
  const updateWbOrder = graphql(`
    mutation UpdateWbOrder($input: UpdateWbInput!) {
      updateWbOrder(input: $input) {
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

  return useMutation({
    mutationFn: (variables: UpdateWbOrderMutationVariables) => {
      return client.request(updateWbOrder, variables);
    },
    onSuccess(data, variables) {
      const id = variables.input.id;
      console.log({ data });
      queryClient.setQueryData<WbOrderByIdQuery>(['WbOrderById', { id }], {
        wbOrderById: data.updateWbOrder,
      });
    },
    onSettled(data, error, variables, context) {
      return queryClient.invalidateQueries({ queryKey: ['WbOrders'] });
    },
    ...options,
  });
};
