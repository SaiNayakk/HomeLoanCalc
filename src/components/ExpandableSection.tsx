import { useEffect, useId, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, Typography } from '@mui/material';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: string;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  forceOpen?: boolean | null;
}

export function ExpandableSection({
  title,
  children,
  defaultOpen = true,
  icon,
  open,
  onToggle,
  forceOpen,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isControlled = typeof open === 'boolean';

  useEffect(() => {
    if (forceOpen !== null && forceOpen !== undefined) {
      setIsOpen(forceOpen);
      onToggle?.(forceOpen);
    }
  }, [forceOpen]);
  const contentId = useId();
  const expanded = isControlled ? open : isOpen;

  const handleToggle = (_event: React.SyntheticEvent, newExpanded: boolean) => {
    if (!isControlled) setIsOpen(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
      }}
    >
      <Accordion
        expanded={expanded}
        onChange={handleToggle}
        disableGutters
        square
        sx={{
          border: 'none',
          boxShadow: 'none',
          bgcolor: 'transparent',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          aria-controls={contentId}
          expandIcon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'inherit', opacity: 0.6 }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          }
          sx={{
            px: 3,
            py: 2,
            minHeight: 'unset',
            bgcolor: 'background.default',
            borderBottom: expanded ? '1px solid' : 'none',
            borderColor: 'divider',
            '& .MuiAccordionSummary-content': { my: 0 },
            '& .MuiAccordionSummary-expandIconWrapper': { color: 'text.secondary' },
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {icon && (
              <Box component="span" sx={{ fontSize: 18, lineHeight: 1 }}>
                {icon}
              </Box>
            )}
            <Typography fontWeight={700} fontSize={15} color="text.primary">
              {title}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails id={contentId} sx={{ px: 3, py: 2.5, bgcolor: 'background.paper' }}>
          {children}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
