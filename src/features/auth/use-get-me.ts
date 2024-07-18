import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { graphql } from '../../gql';
import { MeQuery } from '../../gql/graphql';
import { client } from '../../graphql-client';
import queryClient from '../../react-query/query-client';
import { InitialDataOptions } from '../../utils/graphql/initial-data-options';
import { isGraphQLRequestError } from '../../utils/graphql/is-graphql-request-error';

export const useGetMe = (options?: InitialDataOptions<MeQuery>) => {
  const navigate = useNavigate();

  const me = graphql(`
    query Me {
      me {
        id
        email
        name
        role
      }
    }
  `);

  return useQuery<MeQuery>({
    queryKey: [(me.definitions[0] as any).name.value],
    queryFn: async () => {
      try {
        return await client.request(me);
      } catch(error) {
        import.meta.env.DEV && console.error('HELP?', error);
        if(isGraphQLRequestError(error) && error.response.errors[0].extensions.code === 'AUTHENTICATION_REQUIRED') {
          queryClient.setQueryData(['Me'], null);
          console.warn('Session timeout!');

          console.log('navigation fired!');
          navigate('/');
        }
        if (isGraphQLRequestError(error) && error.response.errors[0].extensions.code === 'UNAUTHENTICATED') {
          queryClient.setQueryData(['Me'], null);
          console.warn('Unauthenticated!');
        }
        throw error;
      }
    },
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
    meta: {
      toastEnabled: false,
    },
    ...options,
  });
};
