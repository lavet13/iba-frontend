import { graphql } from '../../gql';
import { WbOrderByIdQuery } from '../../gql/graphql';
import { client } from '../../graphql-client';
import { InitialDataOptions } from '../../utils/graphql/initial-data-options';
import { useQuery } from '@tanstack/react-query';
import { isGraphQLRequestError } from '../../utils/graphql/is-graphql-request-error';
import { useNavigate } from 'react-router-dom';

export const useWbOrderById = (
  id: string,
  options?: InitialDataOptions<WbOrderByIdQuery>
) => {
  const navigate = useNavigate();

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
    queryFn: async () => {
      try {
        return await client.request({
          document: wbOrderById,
          variables: { id },
        });
      } catch (error) {
        if (
          isGraphQLRequestError(error) &&
          error.response.errors[0].extensions.code === 'UNAUTHENTICATED'
        ) {
          navigate('/');
        }

        throw error;
      }
    },
    meta: {
      toastEnabled: false,
    },
    ...options,
  });
};
