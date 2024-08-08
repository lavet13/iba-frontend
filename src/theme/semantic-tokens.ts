import { defineStyle } from '@chakra-ui/react';

const semanticTokens = defineStyle({
  colors: {
    'scrollbar-thumb-bg': {
      _light: 'gray.300',
      _dark: 'gray.600',
    },
    'scrollbar-thumb-hover-bg': {
      _light: 'gray.400',
      _dark: 'gray.500',
    },

  },
});

export default semanticTokens;
