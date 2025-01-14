import execa from "execa";
import { resolve } from "path";

function roverBin() {
  return resolve(process.env.PWD, "./node_modules/.bin/rover");
}

/**
 * @param {string} url
 * @param {string[] | undefined} [headers]
 */
export async function roverSubgraphIntrospect(url, headers) {
  const proc = execa("node", [
    roverBin(),
    "subgraph",
    "introspect",
    url,
    ...(headers ? headers.map((h) => ["--header", h]).flat() : []),
  ]);

  return (await proc).stdout;
}

/**
 * @param {string} graphRef
 * @param {string} subgraph
 */
export async function roverSubgraphFetch(graphRef, subgraph) {
  const proc = execa("node", [
    roverBin(),
    "subgraph",
    "fetch",
    graphRef,
    "--name",
    subgraph,
  ]);

  return (await proc).stdout;
}

/**
 * @param {string} graphRef
 * @param {string} subgraph
 */
 export async function roverSubgraphDelete(graphRef, subgraph) {
  const proc = execa("node", [
    roverBin(),
    "subgraph",
    "delete",
    graphRef,
    "--name",
    subgraph,
    "--confirm",
  ]);

  return (await proc).stdout;
}

/**
 * @param {string} graphRef
 */
 export async function roverSubgraphList(graphRef) {
  const proc = execa("node", [
    roverBin(),
    "subgraph",
    "list",
    graphRef
  ]);

  return (await proc).stdout;
}

/**
 * @param {{
 *  graphRef: string;
 *  name: string;
 *  schema: string | '-';
 *  stdin: string | undefined;
 *  profile?: string;
 *  log?: string;
 *  queryCountThreshold?: string;
 *  queryPercentageThreshold?: string;
 *  validationPeriod?: string;
 * }} params
 */
export async function roverSubgraphCheck({
  graphRef,
  name,
  schema,
  stdin,
  profile,
  log,
  queryCountThreshold,
  queryPercentageThreshold,
  validationPeriod,
}) {
  const proc = execa(
    "node",
    [
      roverBin(),
      "subgraph",
      "check",
      graphRef,
      "--name",
      name,
      "--schema",
      schema,
      ...(profile ? ["--profile", profile] : []),
      ...(log ? ["--log", log] : []),
      ...(queryCountThreshold
        ? ["--query-count-threshold", queryCountThreshold]
        : []),
      ...(queryPercentageThreshold
        ? ["--query-percentage-threshold", queryPercentageThreshold]
        : []),
      ...(validationPeriod ? ["--validation-period", validationPeriod] : []),
    ],
    {
      input: stdin,
      env: { APOLLO_KEY: process.env.APOLLO_KEY },
    }
  );

  proc.stdout?.pipe(process.stdout);
  proc.stderr?.pipe(process.stderr);
  await proc;

  return proc.exitCode;
}

/**
 * @param {{
 *  graphRef: string;
 *  name: string;
 *  routingUrl: string;
 *  schema: string | '-';
 *  stdin: string | undefined;
 *  profile?: string;
 *  log?: string
 * }} params
 */
export async function roverSubgraphPublish({
  graphRef,
  name,
  routingUrl,
  schema,
  stdin,
  profile,
  log,
}) {
  const proc = execa(
    "node",
    [
      roverBin(),
      "subgraph",
      "publish",
      "--convert",
      graphRef,
      "--name",
      name,
      "--routing-url",
      routingUrl,
      "--schema",
      schema,
      ...(profile ? ["--profile", profile] : []),
      ...(log ? ["--log", log] : []),
    ],
    {
      input: stdin,
      env: { APOLLO_KEY: process.env.APOLLO_KEY },
    }
  );

  proc.stdout?.pipe(process.stdout);
  proc.stderr?.pipe(process.stderr);
  await proc;
  return proc.exitCode;
}
