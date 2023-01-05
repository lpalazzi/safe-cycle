import React from 'react';
import { AppShell } from '@mantine/core';
import { Sidebar } from './Sidebar';

type ShellProps = {
  children?: React.ReactNode;
};

export const Shell: React.FC<ShellProps> = (props) => {
  return (
    <AppShell padding={0} navbar={<Sidebar />}>
      {props.children}
    </AppShell>
  );
};
