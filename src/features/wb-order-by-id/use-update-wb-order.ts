import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { UpdateWbOrderMutation, UpdateWbOrderMutationVariables } from "../../gql/graphql";
import { graphql } from "../../gql";
import { client } from "../../graphql-client";

export const useUpdateWbOrder = (
  options?: UseMutationOptions<UpdateWbOrderMutation, Error, UpdateWbOrderMutationVariables>
) => {
  const updateWbOrder = graphql(`
    mutation UpdateWbOrder($input: UpdateWbInput!) {
      updateWbOrder(input: $input) {
        id
      }
    }
  `);

  return useMutation({
    mutationFn: (variables: UpdateWbOrderMutationVariables) => {
      return client.request(updateWbOrder, variables);
    },
    ...options,
  });
};


