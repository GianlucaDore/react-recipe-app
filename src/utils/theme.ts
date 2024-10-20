import { createTheme, ThemeOptions } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#4e342e',
    },
    secondary: {
      main: '#c30332',
    },
    background: {
      default: '#fff5e1',
      paper: '#f5dac5',
    },
    text: {
      secondary: '#800020',
      primary: '#4E342E',
    },
  },
  typography: {
    body1: {
      fontFamily: 'Roboto',
    },
    fontFamily: 'Bangers',
    caption: {
      fontFamily: 'Do Hyeon',
    },
    overline: {
      fontFamily: 'Do Hyeon',
    },
    body2: {
      fontFamily: 'Roboto',
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;