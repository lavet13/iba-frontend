import { Styles } from '@chakra-ui/theme-tools';
import { cssVar } from '@chakra-ui/react';

const $chakraColorsScrollbarThumbBg = cssVar(
  'chakra-colors-scrollbar-thumb-bg'
);


const styles: Styles = {
  global: _ => ({
    html: { fontSize: { base: 'lg', sm: 'xl' } },
    '*': {
      scrollbarWidth: 'thin',
      scrollbarColor: `${$chakraColorsScrollbarThumbBg.reference} transparent`,
    },
    '*::-webkit-scrollbar': {
      padding: '2px',
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-button': {
      display: 'none',
    },
    '::-webkit-scrollbar-track': {
      display: 'none',
    },

    '::-webkit-scrollbar-thumb': {
      bg: 'scrollbar-thumb-bg',
      borderRadius: '4px',
      transition: `background 0.9s`,
    },
    '::-webkit-scrollbar-thumb:hover': {
      bg: 'scrollbar-thumb-hover-bg',
    },

  }),
};

export default styles;

