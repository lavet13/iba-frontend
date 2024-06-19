import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { CreateWbOrderMutation, CreateWbOrderMutationVariables } from "../../gql/graphql";
import { graphql } from "../../gql";
import client from "../../graphql-client";

export const useCreateWbOrder = (
  options?: UseMutationOptions<CreateWbOrderMutation, Error, CreateWbOrderMutationVariables>
) => {
  const createWbOrder = graphql(`
    mutation CreateWbOrder($input: WbOrderInput!) {
      saveWbOrder(input: $input)
    }
  `);

  return useMutation({
    mutationFn: (variables: CreateWbOrderMutationVariables) => {
      return client.request(createWbOrder, variables);
    },
    ...options,
  });
};


