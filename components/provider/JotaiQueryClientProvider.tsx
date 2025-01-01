'use client';

import { queryClient } from '@/lib/query';
import { QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const JotaiQueryClientProvider = ({ children }: PropsWithChildren) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default JotaiQueryClientProvider;
