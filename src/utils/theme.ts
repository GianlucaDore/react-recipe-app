import { createTheme, ThemeOptions } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#3B2F2F',
    },
    secondary: {
      main: '#FF5722',
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
      fontFamily: 'Roboto, sans-serif',
    },
    fontFamily: 'Georgia',
    caption: {
      fontFamily: 'Do Hyeon',
    },
    overline: {
      fontFamily: 'Do Hyeon',
    },
    body2: {
      fontFamily: 'Roboto, sans-serif',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)', 
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '15px',
          backgroundColor: '#FF5722',
          padding: '5px 17px 5px 17px',
          color: 'white',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: '800'
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        title: {
          fontSize: '1.5rem',
          fontFamily: 'Georgia, sans-serif',
        },
        root: {
          width: 'fit-content',
          padding: '5px 17px 5px 7px',
          borderRadius: '25px',
          marginTop: '12px',
          marginLeft: '10px',
          backgroundColor: '#3B2F2F',
          color: '#fff5e1',
          cursor: 'pointer',
          transition: 'background-color 0.3s, box-shadow 0.3s',
          '&:hover': {
            backgroundColor: '#4A3A3A',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
          }
        }
      }
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          width: 'fit-content',
          marginLeft: 'auto',
          marginBottom: '8px',
          marginRight: '10px',
          padding: '5px 15px 5px 15px',
          borderRadius: '25px',
          backgroundColor: '#3B2F2F',
          color: '#fff5e1',
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            fontWeight: '900'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff5e1',
        },
      },
    },
  }
};

const theme = createTheme(themeOptions);

export default theme;