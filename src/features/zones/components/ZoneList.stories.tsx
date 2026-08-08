import type { Meta, StoryObj } from '@storybook/react';
import { ZoneList } from './ZoneList';

const meta = {
  title: 'Zones/ZoneList',
  component: ZoneList,
  args: { selectedId: null, onSelect: () => {} },
} satisfies Meta<typeof ZoneList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithZones: Story = {
  args: {
    zones: [
      { id: 'zone-1', name: 'Main Hall', description: 'Ground-floor public address' },
      { id: 'zone-2', name: 'Car Park' },
    ],
    selectedId: 'zone-1',
  },
};

export const Empty: Story = {
  args: { zones: [] },
};
