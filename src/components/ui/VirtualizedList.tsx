import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import clsx from 'clsx';

export interface VirtualizedListItem {
  key: string;
  primary: string;
  secondary?: string;
  value?: string;
  meta?: string;
}

interface VirtualizedListProps {
  items: VirtualizedListItem[];
  height?: number;
  itemSize?: number;
}

export const VirtualizedList = ({ items, height = 360, itemSize = 64 }: VirtualizedListProps) => (
  <div className="h-full w-full overflow-hidden">
    <AutoSizer disableHeight>
      {({ width }) => (
        <List
          height={Math.min(height, itemSize * items.length)}
          width={width}
          itemCount={items.length}
          itemData={items}
          itemSize={itemSize}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  </div>
);

const Row = ({ index, style, data }: ListChildComponentProps<VirtualizedListItem[]>) => {
  const item = data[index];
  return (
    <div
      style={style}
      className={clsx(
        'flex items-center gap-4 border-b border-zinc-800/40 px-2 text-sm last:border-none',
        index % 2 === 0 ? 'bg-zinc-900/30' : 'bg-zinc-900/10'
      )}
    >
      <span className="w-8 text-right text-xs text-zinc-500">{index + 1}</span>
      <div className="flex flex-1 flex-col overflow-hidden">
        <span className="truncate font-medium text-white">{item.primary}</span>
        {item.secondary && <span className="truncate text-xs text-zinc-400">{item.secondary}</span>}
      </div>
      {item.meta && <span className="text-xs text-zinc-500">{item.meta}</span>}
      {item.value && <span className="font-semibold text-spotify-green">{item.value}</span>}
    </div>
  );
};
