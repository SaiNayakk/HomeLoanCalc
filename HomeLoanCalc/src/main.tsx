import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './index.css'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    primary: {
      main: '#2f6bff',
    },
    secondary: {
      main: '#0f766e',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Manrope, Segoe UI, sans-serif',
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
