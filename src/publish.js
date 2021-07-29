import { getSchema, loadConfig } from "./config.js";
import { roverSubgraphDelete, roverSubgraphList, roverSubgraphPublish } from "./rover.js";

/**
 * @param {string} table
 */
const getSubgraphNames = (table) => {
  // Being super hacky because JSON output from rover will be released very soon
  const lines = table.split("\n")
    .map(line => line.split(' │ '))
    .filter(items => items.length >= 3)
    .map(items => items[0].replace('│', '').replace(/\s/g, ''))
    .slice(1)

  return lines
};

/**
 * @param {{ graphRef: string; config: string; profile?: string; log?: string; headers?: string[] }} params
 */
export async function publish({ graphRef, config, profile, log, headers }) {
  const { subgraphs, dirname } = await loadConfig(config);
  const currentSubgraphs = getSubgraphNames(await roverSubgraphList(graphRef));
  const subgraphDeathRow = currentSubgraphs.filter(subgraph => !subgraphs[subgraph])

  // Delete each subgraph that is no longer in the config
  for await (const subgraph of subgraphDeathRow) {
    console.log('Deleting subgraph: ', subgraph)
    await roverSubgraphDelete(graphRef, subgraph)

    // add a 2 second delay between each delete to account for a concurrency issue in Studio
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Publish each subgraph in the config
  for await (const [name, subgraph] of Object.entries(subgraphs)) {
    const schema = await getSchema(subgraph.schema, dirname, headers);

    const exitCode = await roverSubgraphPublish({
      graphRef,
      name,
      profile,
      log,
      routingUrl: subgraph.routing_url,
      ...schema,
    });

    if (exitCode !== 0) {
      console.error("Halting");
      process.exit(exitCode || 1);
    }

    // add a 2 second delay between each publish to account for a concurrency issue in Studio
    await new Promise((r) => setTimeout(r, 2000));
  }
}
