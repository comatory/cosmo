import { ClickHouseClient } from '../clickhouse/index.js';

export class OperationsViewRepository {
  constructor(private client: ClickHouseClient) {}

  /**
   * Get operations page data
   */
  public async getOperations({
    organizationId,
    graphId,
    limit,
    offset,
  }: {
    organizationId: string;
    graphId: string;
    limit: number;
    offset: number;
  }) {
    const query = `
      SELECT
        gqlm."OperationHash" AS hash,
        gqlm."OperationName" AS name,
        gqlm."OperationType" AS type,
        max(gqlm."Timestamp") AS timestamp,
        sum(oprm."TotalRequests") as totalRequestCount,
        sum(oprm."TotalErrors") as totalErrorCount,
        count(gqlm."OperationHash") OVER () AS count 
      FROM
        ${this.client.database}.gql_metrics_operations AS gqlm
        INNER JOIN ${this.client.database}.operation_request_metrics_5_30 AS oprm ON gqlm."FederatedGraphID" = oprm."FederatedGraphID"
        AND gqlm."OrganizationID" = oprm."OrganizationID"
        AND gqlm."OperationHash" = oprm."OperationHash"
        AND gqlm."OperationName" = oprm."OperationName"
      WHERE
        "OrganizationID" = '${organizationId}'
        AND "FederatedGraphID" = '${graphId}'
      GROUP BY
        gqlm."OperationHash",
        gqlm."OperationName",
        gqlm."OperationType"
      ORDER BY
        timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const result = await this.client.queryPromise<{
      hash: string;
      name: string;
      type: string;
      timestamp: string;
      totalRequestCount: string;
      totalErrorCount: string;
      count: number;
    }>(query, { organizationId, graphId, limit, offset });

    return {
      count: Number(result?.[0].count),
      operations: result.map(({ count, totalErrorCount, totalRequestCount, ...row }) => ({
        ...row,
        totalErrorCount: BigInt(totalErrorCount),
        totalRequestCount: BigInt(totalRequestCount),
      })),
    };
  }

  public async getOperationClientListByNameHashType({
    organizationId,
    graphId,
    operationName,
    operationHash,
    operationType,
    limit,
    offset,
  }: {
    organizationId: string;
    graphId: string;
    operationName: string;
    operationHash: string;
    operationType: string;
    limit: number;
    offset: number;
  }) {
    const query = `
      SELECT
        "Timestamp" AS timestamp,
        "OperationHash" AS hash,
        "TotalRequests" AS totalRequests,
        "TotalErrors" AS totalErrors,
        "ClientName" AS clientName,
        "ClientVersion" AS clientVersion,
        COUNT(*) OVER() as count
      FROM
        ${this.client.database}.operation_request_metrics_5_30
      WHERE
        "OperationName" = '${operationName}'
        AND "OperationType" = '${operationType}'
        AND "OperationHash" = '${operationHash}'
        AND "OrganizationID" = '${organizationId}'
        AND "FederatedGraphID" = '${graphId}'
      ORDER BY
        timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const result = await this.client.queryPromise<{
      timestamp: string;
      hash: string;
      totalRequests: string;
      totalErrors: string;
      clientName: string;
      clientVersion: string;
      count: number;
    }>(query, { organizationId, graphId, limit, offset });

    return {
      count: Number(result?.[0].count),
      clients: result.map(({ count, totalRequests, totalErrors, ...row }) => ({
        ...row,
        totalRequests: BigInt(totalRequests),
        totalErrors: BigInt(totalErrors),
      })),
    };
  }
}
