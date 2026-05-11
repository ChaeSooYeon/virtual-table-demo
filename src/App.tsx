import {
  Card,
  Segmented,
  Select,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import VirtualTable, { type VirtualColumn } from './VirtualTable';
import './App.css';

type TableMode = 'plain' | 'memo' | 'virtual';

type DemoRow = {
  id: number;
  name: string;
  status: 'Open' | 'Pending' | 'Closed';
  amount: number;
  owner: string;
  region: string;
  progress: number;
  updatedAt: string;
  extra01: string;
  extra02: string;
  extra03: string;
  extra04: string;
  extra05: string;
  extra06: string;
  extra07: string;
  extra08: string;
  extra09: string;
  extra10: string;
  extra11: string;
  extra12: string;
  extra13: string;
  extra14: string;
  extra15: string;
  extra16: string;
  extra17: string;
  extra18: string;
  extra19: string;
  extra20: string;
  extra21: string;
  extra22: string;
  extra23: string;
  extra24: string;
};

type MetricState = {
  renderMs: number;
  renderedRows: number;
  renderedCells: number;
};

const rowCountOptions = [1000, 10000, 50000];
const columnCount = 16;
const tableHeight = 560;
const rowHeight = 44;

const modeLabels: Record<TableMode, string> = {
  plain: '일반 Table',
  memo: 'useMemo Table',
  virtual: 'Virtual Table',
};

const modeDescriptions: Record<TableMode, string> = {
  plain:
    '비교 기준입니다. 데이터가 많아질수록 전체 row/cell이 DOM 렌더링 대상이 됩니다.',
  memo: 'row와 column 계산 결과를 재사용합니다. 하지만 화면에 올릴 DOM 양은 일반 Table과 거의 같습니다.',
  virtual:
    '고정 높이 viewport 안에서 현재 보이는 row만 렌더링합니다. DOM 렌더링 양 자체를 줄이는 방식입니다.',
};

const statusColors: Record<DemoRow['status'], string> = {
  Open: 'blue',
  Pending: 'gold',
  Closed: 'green',
};

function createRows(rowCount: number): DemoRow[] {
  return Array.from({ length: rowCount }, (_, index) => {
    const status = (['Open', 'Pending', 'Closed'] as const)[index % 3];
    return {
      id: index + 1,
      name: `Record ${String(index + 1).padStart(5, '0')}`,
      status,
      amount: 1000 + ((index * 37) % 90000),
      owner: `Owner ${String.fromCharCode(65 + (index % 8))}`,
      region: `Region ${(index % 6) + 1}`,
      progress: (index * 13) % 100,
      updatedAt: `2026-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}`,
      extra01: `A-${index % 97}`,
      extra02: `B-${index % 89}`,
      extra03: `C-${index % 83}`,
      extra04: `D-${index % 79}`,
      extra05: `E-${index % 73}`,
      extra06: `F-${index % 71}`,
      extra07: `G-${index % 67}`,
      extra08: `H-${index % 61}`,
      extra09: `I-${index % 59}`,
      extra10: `J-${index % 53}`,
      extra11: `K-${index % 47}`,
      extra12: `L-${index % 43}`,
      extra13: `M-${index % 41}`,
      extra14: `N-${index % 37}`,
      extra15: `O-${index % 31}`,
      extra16: `P-${index % 29}`,
      extra17: `Q-${index % 23}`,
      extra18: `R-${index % 19}`,
      extra19: `S-${index % 17}`,
      extra20: `T-${index % 13}`,
      extra21: `U-${index % 11}`,
      extra22: `V-${index % 7}`,
      extra23: `W-${index % 5}`,
      extra24: `X-${index % 3}`,
    };
  });
}

function createVirtualColumns(columnCount: number): VirtualColumn<DemoRow>[] {
  const baseColumns: VirtualColumn<DemoRow>[] = [
    { key: 'id', title: 'ID', dataIndex: 'id', width: 90 },
    { key: 'name', title: 'Name', dataIndex: 'name', width: 170 },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (value) => (
        <Tag color={statusColors[value as DemoRow['status']]}>
          {String(value)}
        </Tag>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      dataIndex: 'amount',
      width: 130,
      render: (value) => Number(value).toLocaleString(),
    },
    { key: 'owner', title: 'Owner', dataIndex: 'owner', width: 130 },
    { key: 'region', title: 'Region', dataIndex: 'region', width: 130 },
    {
      key: 'progress',
      title: 'Progress',
      dataIndex: 'progress',
      width: 130,
      render: (value) => `${value}%`,
    },
    { key: 'updatedAt', title: 'Updated', dataIndex: 'updatedAt', width: 140 },
  ];

  const extraColumns: VirtualColumn<DemoRow>[] = Array.from(
    { length: 24 },
    (_, index) => {
      const key = `extra${String(index + 1).padStart(2, '0')}` as keyof DemoRow;
      return {
        key,
        title: `Extra ${index + 1}`,
        dataIndex: key,
        width: 120,
      };
    },
  );

  return [...baseColumns, ...extraColumns].slice(0, columnCount);
}

function toAntdColumns(
  columns: VirtualColumn<DemoRow>[],
): ColumnsType<DemoRow> {
  return columns.map((column) => ({
    key: column.key,
    dataIndex: column.dataIndex,
    title: column.title,
    width: column.width,
    ellipsis: column.ellipsis ?? true,
    render: column.render
      ? (value, row, rowIndex) => column.render?.(value, row, rowIndex)
      : undefined,
  }));
}

export default function App() {
  const [mode, setMode] = useState<TableMode>('virtual');
  const [rowCount, setRowCount] = useState(10000);
  const [metrics, setMetrics] = useState<MetricState>({
    renderMs: 0,
    renderedRows: 0,
    renderedCells: 0,
  });
  const renderStartedAtRef = useRef(0);

  const rows = useMemo(() => createRows(rowCount), [rowCount]);
  const virtualColumns = useMemo(() => createVirtualColumns(columnCount), []);
  const plainColumns = toAntdColumns(virtualColumns);
  const memoColumns = useMemo(
    () => toAntdColumns(virtualColumns),
    [virtualColumns],
  );
  const memoRows = useMemo(() => rows, [rows]);
  const activeColumnCount = virtualColumns.length;

  const markRenderStart = () => {
    renderStartedAtRef.current = performance.now();
  };

  useLayoutEffect(() => {
    if (mode === 'virtual') return undefined;

    const startedAt = renderStartedAtRef.current || performance.now();
    const frameId = requestAnimationFrame(() => {
      setMetrics({
        renderMs: performance.now() - startedAt,
        renderedRows: rowCount,
        renderedCells: rowCount * activeColumnCount,
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [activeColumnCount, mode, rowCount]);

  const handleModeChange = (nextMode: TableMode) => {
    markRenderStart();
    setMode(nextMode);
  };

  const handleRowCountChange = (nextRowCount: number) => {
    markRenderStart();
    setRowCount(nextRowCount);
  };

  const table = (() => {
    if (mode === 'virtual') {
      return (
        <VirtualTable<DemoRow>
          columns={virtualColumns}
          data={rows}
          height={tableHeight}
          rowHeight={rowHeight}
          onRenderedRowsChange={(range) => {
            const renderedRows = range.rowStopIndex - range.rowStartIndex + 1;
            const renderedCells = renderedRows * activeColumnCount;

            setMetrics((prevMetrics) => {
              if (
                prevMetrics.renderedRows === renderedRows &&
                prevMetrics.renderedCells === renderedCells
              ) {
                return prevMetrics;
              }

              return {
                renderMs: performance.now() - renderStartedAtRef.current,
                renderedRows,
                renderedCells,
              };
            });
          }}
        />
      );
    }

    return (
      <Table<DemoRow>
        bordered
        columns={mode === 'memo' ? memoColumns : plainColumns}
        dataSource={mode === 'memo' ? memoRows : rows}
        pagination={false}
        rowKey="id"
        scroll={{ x: activeColumnCount * 130, y: tableHeight }}
        size="small"
      />
    );
  })();

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Virtualization benchmark</p>
          <Typography.Title level={1}>
            대량 데이터 가상 테이블 데모
          </Typography.Title>
          <Typography.Text>
            useMemo는 계산 재사용에는 도움이 되지만 DOM 렌더링 양 자체를 줄이지
            못합니다. Virtual Table은 보이는 row만 렌더링해 병목의 위치를 직접
            줄입니다.
          </Typography.Text>
        </div>
      </section>

      <Card className="control-card" size="small">
        <div className="control-grid">
          <label>
            <span>Mode</span>
            <Segmented
              options={[
                { label: '일반', value: 'plain' },
                { label: 'useMemo', value: 'memo' },
                { label: '가상화', value: 'virtual' },
              ]}
              value={mode}
              onChange={(value) => handleModeChange(value as TableMode)}
            />
          </label>
          <label>
            <span>데이터 수</span>
            <Select
              value={rowCount}
              onChange={handleRowCountChange}
              options={rowCountOptions.map((value) => ({
                value,
                label: value.toLocaleString(),
              }))}
            />
          </label>
        </div>
      </Card>

      <Card className="mode-card" size="small">
        <strong>{modeLabels[mode]}</strong>
        <Typography.Text>{modeDescriptions[mode]}</Typography.Text>
      </Card>

      <section className="metric-grid">
        <Card size="small">
          <Statistic title="전체 데이터 수" value={rowCount} />
          <p>현재 테이블에 전달한 전체 row 개수입니다.</p>
        </Card>
        <Card size="small">
          <Statistic title="컬럼 수" value={activeColumnCount} />
          <p>현재 표시 중인 컬럼 개수입니다.</p>
        </Card>
        <Card size="small">
          <Statistic title="렌더링 row 수" value={metrics.renderedRows} />
          <p>실제로 화면 렌더링 대상이 된 row 개수입니다.</p>
        </Card>
        <Card size="small">
          <Statistic title="예상 cell 수" value={metrics.renderedCells} />
          <p>렌더링 row 수에 컬럼 수를 곱한 예상 DOM cell 개수입니다.</p>
        </Card>
        <Card size="small">
          <Statistic
            title="반영 시간"
            value={metrics.renderMs}
            precision={1}
            suffix="ms"
          />
          <p>옵션 변경 후 다음 frame까지 걸린 대략적인 UI 반영 시간입니다.</p>
        </Card>
      </section>

      <Card className="table-card" title={modeLabels[mode]}>
        {table}
      </Card>
    </main>
  );
}
