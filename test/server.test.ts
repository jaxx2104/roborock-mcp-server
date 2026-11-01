import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";

const entrypoint = fileURLToPath(new URL("../src/index.ts", import.meta.url));

describe("roborock-mcp-server over stdio", () => {
  const client = new Client(
    { name: "roborock-mcp-server-test", version: "0.0.0" },
    { capabilities: {} },
  );

  beforeAll(async () => {
    // Only the SDK's safe default environment is passed, so ROBOROCK_* are
    // unset and the Python bridge exits before contacting the Roborock cloud.
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["run", entrypoint],
      env: getDefaultEnvironment(),
    });
    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
  });

  test("lists all vacuum control tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual(
      [
        "get_map",
        "locate_vacuum",
        "pause_cleaning",
        "return_to_dock",
        "room_clean",
        "start_cleaning",
        "stop_cleaning",
        "vacuum_status",
        "zone_clean",
      ].sort(),
    );
  });

  test("requires zones for zone_clean and room_ids for room_clean", async () => {
    const { tools } = await client.listTools();
    const byName = new Map(tools.map((tool) => [tool.name, tool]));
    expect(byName.get("zone_clean")?.inputSchema.required).toEqual(["zones"]);
    expect(byName.get("room_clean")?.inputSchema.required).toEqual([
      "room_ids",
    ]);
  });

  test("returns an error result when the Python bridge fails", async () => {
    // Without credentials the spawned Python process cannot succeed, so this
    // exercises the subprocess path and its error handling end to end.
    const result = await client.request(
      {
        method: "tools/call",
        params: { name: "vacuum_status", arguments: {} },
      },
      CallToolResultSchema,
    );
    expect(result.isError).toBe(true);
    expect(result.content[0]?.type).toBe("text");
    expect(String(result.content[0]?.text)).toContain(
      "Error getting vacuum status",
    );
  }, 30_000);

  test("rejects unknown tools", async () => {
    await expect(
      client.request(
        { method: "tools/call", params: { name: "no_such_tool" } },
        CallToolResultSchema,
      ),
    ).rejects.toThrow("Unknown tool: no_such_tool");
  });
});
