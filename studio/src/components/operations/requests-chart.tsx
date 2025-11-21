import { OperationDetailRequestMetrics } from "@wundergraph/cosmo-connect/dist/platform/v1/platform_pb";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Tooltip,
} from "recharts";
import { formatDateTime } from "@/lib/format-date";

const tickFormatter = (tick: number) =>
  tick === 0 || tick % 1 != 0 ? "" : `${tick}`;

const getStrokeColor = (strokeStyle: "normal" | "error") => {
  switch (strokeStyle) {
    case "normal":
      return "hsl(var(--chart-primary))";
    case "error":
      return "hsl(var(--destructive))";
    default:
      return "hsl(var(--chart-primary))";
  }
};

export const RequestsChart = ({
  data,
  strokeStyle,
  syncId,
}: {
  data: OperationDetailRequestMetrics['requests'];
  strokeStyle: "normal" | "error";
  syncId: string;
}) => {
  const chartData = data.map(({ count, timestamp, ...rest }) => {
    const isoTimestamp = timestamp.replace(" ", "T") + "Z";
    const timestampMs = new Date(isoTimestamp).getTime();

    return {
      ...rest,
      count: Number(count),
      timestamp: timestampMs,
    };
  });

  const timestamps = chartData.map((d) => d.timestamp);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const strokeColor = getStrokeColor(strokeStyle);

  return (
    <ResponsiveContainer width="99%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
        syncId={syncId}
      >
        <Line
          name="count"
          type="monotone"
          dataKey="count"
          animationDuration={300}
          dot={false}
          strokeWidth={2}
          stroke={strokeColor}
        />

        <XAxis
          dataKey="timestamp"
          type="number"
          domain={[minTimestamp, maxTimestamp]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: "13px" }}
          tickFormatter={(value) => formatDateTime(value)}
          axisLine={false}
          tickCount={5}
        />

        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: "13px" }}
          tickFormatter={tickFormatter}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          wrapperClassName="rounded-md border !border-popover !bg-popover/60 p-2 text-sm shadow-md outline-0 backdrop-blur-lg"
          labelFormatter={(label) => formatDateTime(parseInt(label as string))}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
