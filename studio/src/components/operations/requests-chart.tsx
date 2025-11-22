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

export const RequestsChart = ({
  data,
  syncId,
}: {
  data: { timestamp: string; requests: bigint; errors: bigint}[];
  syncId: string;
}) => {

  const chartData = data.map(({ requests, errors, timestamp, ...rest }) => {
    const isoTimestamp = timestamp.replace(" ", "T") + "Z";
    const timestampMs = new Date(isoTimestamp).getTime();

    return {
      ...rest,
      requests: Number(requests),
      errors: Number(errors),
      timestamp: timestampMs,
    };
  });
  const timestamps = chartData.map((d) => d.timestamp);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);

  return (
    <ResponsiveContainer width="99%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
        syncId={syncId}
      >
        <Line
          name="Requests"
          type="monotone"
          dataKey="requests"
          animationDuration={300}
          dot={false}
          strokeWidth={2}
          stroke="hsl(var(--chart-primary))"
        />

        <Line
          name="Errors"
          type="monotone"
          dataKey="errors"
          animationDuration={300}
          dot={false}
          strokeWidth={2}
          stroke="hsl(var(--destructive))"
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
