import ResizeObserver from 'rc-resize-observer';
import { Grid, useGridRef } from 'react-window';
import type { CSSProperties } from 'react';
import { useLayoutEffect, useMemo, useState } from 'react';

export type VirtualColumn<RowType extends object> = {
  key: string;
  title: string;
  dataIndex: keyof RowType;
  width?: number;
  ellipsis?: boolean;
  render?: (
    value: RowType[keyof RowType],
    row: RowType,
    rowIndex: number,
  ) => React.ReactNode;
};

type RenderRange = {
  rowStartIndex: number;
  rowStopIndex: number;
};

type VirtualTableProps<RowType extends object> = {
  columns: VirtualColumn<RowType>[];
  data: RowType[];
  height: number;
  rowHeight?: number;
  overscanCount?: number;
  onRenderedRowsChange?: (range: RenderRange) => void;
};

type CellProps<RowType extends object> = {
  columns: Required<VirtualColumn<RowType>>[];
  data: RowType[];
};

const DEFAULT_ROW_HEIGHT = 44;

const normalizeColumns = <RowType extends object>(
  columns: VirtualColumn<RowType>[],
  tableWidth: number,
) => {
  const explicitWidth = columns.reduce(
    (sum, column) => sum + (column.width ?? 0),
    0,
  );
  const flexibleColumns = columns.filter((column) => !column.width).length;
  const fallbackWidth =
    flexibleColumns > 0
      ? Math.max(
          120,
          Math.floor((tableWidth - explicitWidth) / flexibleColumns),
        )
      : 140;

  return columns.map((column) => ({
    ...column,
    width: column.width ?? fallbackWidth,
    ellipsis: column.ellipsis ?? true,
    render:
      column.render ?? ((value: RowType[keyof RowType]) => String(value ?? '')),
  }));
};

function VirtualCell<RowType extends object>({
  columns,
  columnIndex,
  data,
  rowIndex,
  style,
}: {
  columns: Required<VirtualColumn<RowType>>[];
  columnIndex: number;
  data: RowType[];
  rowIndex: number;
  style: CSSProperties;
}) {
  const column = columns[columnIndex];
  const row = data[rowIndex];
  const value = row[column.dataIndex];

  return (
    <div
      className={column.ellipsis ? 'virtual-cell is-ellipsis' : 'virtual-cell'}
      style={style}
      title={column.ellipsis ? String(value ?? '') : undefined}
    >
      {column.render(value, row, rowIndex)}
    </div>
  );
}

// 고정 높이 viewport 안에서 보이는 cell만 렌더링한다.
// 핵심은 데이터 계산을 줄이는 것이 아니라 DOM에 올라가는 row/cell 수 자체를 줄이는 것이다.
export default function VirtualTable<RowType extends object>({
  columns,
  data,
  height,
  onRenderedRowsChange,
  overscanCount = 4,
  rowHeight = DEFAULT_ROW_HEIGHT,
}: VirtualTableProps<RowType>) {
  const [tableWidth, setTableWidth] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const gridRef = useGridRef(null);

  const mergedColumns = useMemo(
    () => normalizeColumns(columns, tableWidth),
    [columns, tableWidth],
  );
  const totalWidth = mergedColumns.reduce(
    (sum, column) => sum + column.width,
    0,
  );

  useLayoutEffect(() => {
    const element = gridRef.current?.element;
    if (!element) return undefined;

    const handleScroll = () => setScrollLeft(element.scrollLeft);
    element.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => element.removeEventListener('scroll', handleScroll);
  }, [gridRef]);

  return (
    <ResizeObserver
      onResize={({ width }) => {
        setTableWidth((prevWidth) => (prevWidth === width ? prevWidth : width));
      }}
    >
      <div className="virtual-table-shell">
        <div className="virtual-header-viewport">
          <div
            className="virtual-header-row"
            style={{
              transform: `translateX(${-scrollLeft}px)`,
              width: totalWidth,
            }}
          >
            {mergedColumns.map((column) => (
              <div
                className="virtual-header-cell"
                key={column.key}
                style={{ width: column.width }}
              >
                {column.title}
              </div>
            ))}
          </div>
        </div>
        <Grid<CellProps<RowType>>
          cellComponent={VirtualCell<RowType>}
          cellProps={{ columns: mergedColumns, data }}
          className="virtual-grid"
          columnCount={mergedColumns.length}
          columnWidth={(index) => mergedColumns[index].width}
          defaultHeight={height}
          defaultWidth={tableWidth}
          gridRef={gridRef}
          onCellsRendered={(_visibleCells, allCells) => {
            onRenderedRowsChange?.({
              rowStartIndex: allCells.rowStartIndex,
              rowStopIndex: allCells.rowStopIndex,
            });
          }}
          overscanCount={overscanCount}
          rowCount={data.length}
          rowHeight={rowHeight}
          style={{ height, width: tableWidth }}
        />
      </div>
    </ResizeObserver>
  );
}
