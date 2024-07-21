import { FC, PropsWithChildren } from 'react';
import {
  ChakraProvider as Provider,
  cookieStorageManagerSSR,
  localStorageManager,
} from '@chakra-ui/react';

import theme from '.';

type ChakraProviderProps = PropsWithChildren & { cookies?: string };

export const ChakraProvider: FC<ChakraProviderProps> = ({
  cookies,
  children,
}) => {
  const colorModeManager =
    typeof cookies === 'string'
      ? cookieStorageManagerSSR(cookies)
      : localStorageManager;

  return (
    <Provider theme={theme} colorModeManager={colorModeManager}>
      {children}
    </Provider>
  );
};
