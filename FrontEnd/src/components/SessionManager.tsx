import React from 'react';
import { useRestoreSession } from '../hooks/useRestoreSession';

/**
 * Component that handles session restoration and polling.
 * Should be placed inside Router and GameProvider.
 */
export const SessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useRestoreSession();
  
  return <>{children}</>;
};
