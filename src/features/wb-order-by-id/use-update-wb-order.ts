import {
  UseMutationOptions,
  useMutation,
  InfiniteData,
} from '@tanstack/react-query';
import {
  UpdateWbInput,
  UpdateWbOrderMutation,
  UpdateWbOrderMutationVariables,
  WbOrderByIdQuery,
  WbOrdersQuery,
} from '../../gql/graphql';
import { graphql } from '../../gql';
import { client } from '../../graphql-client';
import queryClient from '../../react-query/query-client';
import { take } from '../../pages/admin/wb-orders';
import { useNavigate } from 'react-router-dom';
import { isGraphQLRequestError } from '../../utils/graphql/is-graphql-request-error';

export const useUpdateWbOrder = (
  options?: UseMutationOptions<
    UpdateWbOrderMutation,
    Error,
    UpdateWbOrderMutationVariables
  >
) => {
  const navigate = useNavigate();

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
    mutationFn: async (variables: UpdateWbOrderMutationVariables) => {
      try {
        return await client.request(updateWbOrder, variables);
      } catch(error) {
        if (
          isGraphQLRequestError(error) &&
          error.response.errors[0].extensions.code === 'UNAUTHENTICATED'
        ) {
          navigate('/');
        }

        throw error;
      }
    },
    // @ts-ignore
    async onMutate(variables) {
      const id = variables.input.id;

      // cancel any outgoing refetches
      // (so they don't override our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['WbOrderById', { id }] });

      // snapshot the previous value
      const previousWbOrder = queryClient.getQueryData<WbOrderByIdQuery>([
        'WbOrderById',
        { id },
      ])!;

      const wbOrderById = variables.input;

      queryClient.setQueryData<WbOrderByIdQuery>(['WbOrderById', { id }], {
        wbOrderById,
      });

      return { previousWbOrder };
    },
    onError(error, variables, context) {
      const id = context!.previousWbOrder.wbOrderById!.id;
      const wbOrderById = context!.previousWbOrder.wbOrderById;

      queryClient.setQueryData<WbOrderByIdQuery>(['WbOrderById', { id }], {
        wbOrderById,
      });
    },
    onSettled() {
      return queryClient.invalidateQueries({ queryKey: ['WbOrders'] });
    },
    ...options,
  });
};
