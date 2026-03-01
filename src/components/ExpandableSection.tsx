import { useId, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: string;
  open?: boolean;
  onToggle?: (open: boolean) => void;
}

export function ExpandableSection({
  title,
  children,
  defaultOpen = true,
  icon,
  open,
  onToggle,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isControlled = typeof open === 'boolean';
  const contentId = useId();

  const handleToggle = (_event: React.SyntheticEvent, expanded: boolean) => {
    if (!isControlled) {
      setIsOpen(expanded);
    }
    onToggle?.(expanded);
  };

  return (
    <Accordion
      expanded={isControlled ? open : isOpen}
      onChange={handleToggle}
      disableGutters
      square={false}
      sx={{
        borderRadius: 0,
        border: 'none',
        boxShadow: 'none',
        background: 'transparent',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        aria-controls={contentId}
        expandIcon={
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        }
        sx={{
          px: 0,
          py: 1.5,
          borderTop: '1px solid #e5e7eb',
          borderBottom: isOpen ? 'none' : '1px solid #e5e7eb',
          '& .MuiAccordionSummary-content': { my: 0, justifyContent: 'center' },
        }}
      >
        <Box display="flex" alignItems="center" gap={1} justifyContent="center" width="100%">
          {icon && <Box component="span" sx={{ fontSize: 16 }}>{icon}</Box>}
          <Typography fontWeight={700} fontSize={16} color="#0f172a">
            {title}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails
        id={contentId}
        sx={{
          px: 0,
          pb: 2,
          pt: 2,
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'transparent',
        }}
      >
        <Box display="flex" flexDirection="column" gap={2}>
          {children}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
