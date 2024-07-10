import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { RegisterMutation, RegisterMutationVariables } from "../../gql/graphql";
import { graphql } from "../../gql";
import { client } from "../../graphql-client";

export const useSignup = (
  options?: UseMutationOptions<RegisterMutation, Error, RegisterMutationVariables>
) => {
  const register = graphql(`
    mutation Register($signupInput: SignupInput!) {
      signup(signupInput: $signupInput) {
        accessToken
        refreshToken
      }
    }
  `);

  return useMutation({
    mutationFn: (variables: RegisterMutationVariables) => {
      return client.request(register, variables);
    },
    ...options,
  });
};
