import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Shared/Button',
  component: Button,
  args: { children: 'Button' },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary', children: 'Primary' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } };
