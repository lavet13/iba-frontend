import { Spinner, Center } from "@chakra-ui/react";
import { Suspense } from 'react';

export const Loadable =
  (
    Component: React.ComponentType,
    fallback = (
      <Center flex='1' width={'full'}>
        <Spinner />
      </Center>
    )
  ) =>
  (props: JSX.IntrinsicAttributes) =>
    (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
