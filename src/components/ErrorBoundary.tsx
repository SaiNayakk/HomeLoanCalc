import { Component } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface Props { children: React.ReactNode; fallback?: string; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error('ErrorBoundary caught:', error); }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <Typography color="text.secondary" mb={1}>{this.props.fallback ?? 'Something went wrong loading this section.'}</Typography>
          <Button size="small" onClick={() => this.setState({ hasError: false })}>Retry</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
