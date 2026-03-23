import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import type { LoanInput, LoanCalculation } from '../engine';
import { formatCurrency, formatCompact } from '../utils/formatters';

const STORAGE_KEY = 'hlc_saved';
const MAX_SAVED = 5;

interface SavedItem {
  id: string;
  label: string;
  savedAt: string;
  input: LoanInput;
  summary: {
    emi: number;
    totalInterest: number;
    tenureMonths: number;
  };
}

interface SavedCalculationsProps {
  currentInput: LoanInput;
  currentCalculation: LoanCalculation | null;
  onLoad: (input: LoanInput) => void;
}

function readFromStorage(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedItem[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(items: SavedItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function buildLabel(input: LoanInput): string {
  const principal = formatCompact(input.principal);
  const rate = input.annualRate.toFixed(1);
  const years = Math.round(input.tenureMonths / 12);
  return `${principal} @ ${rate}% · ${years}y`;
}

function formatSavedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function SavedCalculations({
  currentInput,
  currentCalculation,
  onLoad,
}: SavedCalculationsProps) {
  const [saved, setSaved] = useState<SavedItem[]>(() => readFromStorage());

  // Keep state in sync if localStorage is updated externally (e.g. another tab)
  useEffect(() => {
    const handler = () => setSaved(readFromStorage());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isFull = saved.length >= MAX_SAVED;
  const canSave = currentCalculation !== null && !isFull;

  function handleSave() {
    if (!currentCalculation) return;
    const newItem: SavedItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: buildLabel(currentInput),
      savedAt: new Date().toISOString(),
      input: currentInput,
      summary: {
        emi: currentCalculation.monthlyEMI,
        totalInterest: currentCalculation.totalInterest,
        tenureMonths: currentCalculation.actualTenureMonths,
      },
    };
    const updated = [newItem, ...saved].slice(0, MAX_SAVED);
    setSaved(updated);
    writeToStorage(updated);
  }

  function handleDelete(id: string) {
    const updated = saved.filter((item) => item.id !== id);
    setSaved(updated);
    writeToStorage(updated);
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: 'divider',
        boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box px={3} pt={3} pb={2} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
        <Box>
          <Typography fontWeight={700} fontSize={16} color="text.primary">
            Saved Calculations
          </Typography>
          <Typography fontSize={13} color="text.secondary" mt={0.5}>
            Up to {MAX_SAVED} calculations can be saved locally.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          disabled={!canSave}
          onClick={handleSave}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Save Current
        </Button>
      </Box>

      {/* Warning when full */}
      {isFull && (
        <Box px={3} pb={1}>
          <Typography fontSize={12} color="warning.main" fontWeight={600}>
            Maximum of {MAX_SAVED} saved calculations reached. Delete one to save a new entry.
          </Typography>
        </Box>
      )}

      {/* Saved items list */}
      <Box px={3} pb={3} display="flex" flexDirection="column" gap={1.5}>
        {saved.length === 0 ? (
          <Box
            py={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}
          >
            <Typography fontSize={14} color="text.secondary">
              No saved calculations yet
            </Typography>
          </Box>
        ) : (
          saved.map((item) => (
            <Paper
              key={item.id}
              variant="outlined"
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2,
                borderColor: 'divider',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {/* Label + date */}
              <Box flex={1} minWidth={0}>
                <Typography
                  fontWeight={700}
                  fontSize={14}
                  color="text.primary"
                  noWrap
                >
                  {item.label}
                </Typography>
                <Box display="flex" gap={2} mt={0.25} flexWrap="wrap">
                  <Typography fontSize={12} color="text.secondary">
                    {formatSavedDate(item.savedAt)}
                  </Typography>
                  <Typography fontSize={12} color="primary.main" fontWeight={600}>
                    EMI {formatCurrency(item.summary.emi)}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    Interest {formatCompact(item.summary.totalInterest)}
                  </Typography>
                </Box>
              </Box>

              {/* Actions */}
              <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onLoad(item.input)}
                  sx={{ minWidth: 60 }}
                >
                  Load
                </Button>
                <IconButton
                  size="small"
                  aria-label="Delete saved calculation"
                  onClick={() => handleDelete(item.id)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                >
                  ✕
                </IconButton>
              </Box>
            </Paper>
          ))
        )}
      </Box>
    </Paper>
  );
}
