import { defineStyleConfig } from '@chakra-ui/react';

const Button = defineStyleConfig({
  baseStyle: _ => {
    return {
      _loading: {
        cursor: 'pointer',
      },
      _disabled: {
        cursor: 'pointer',
      },
    };
  },
});

export default Button;
