import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { RefreshTokenMutation } from "../../gql/graphql";
import { graphql } from "../../gql";
import { client } from "../../graphql-client";

export const useRefreshToken = (
  options?: UseMutationOptions<RefreshTokenMutation>
) => {
  const refreshToken = graphql(`
    mutation RefreshToken {
      refreshToken {
        accessToken
        refreshToken
      }
    }
  `);

  return useMutation({
    mutationFn: () => {
      return client.request(refreshToken);
    },
    retry: false,
    ...options,
  });
};
