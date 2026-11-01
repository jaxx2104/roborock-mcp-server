import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const entrypoint = fileURLToPath(new URL("../src/index.ts", import.meta.url));

function firstText(result: CallToolResult): string {
  const [first] = result.content;
  if (first?.type !== "text") {
    throw new Error(`Expected text content, got ${JSON.stringify(first)}`);
  }
  return first.text;
}

describe("roborock-mcp-server over stdio", () => {
  const client = new Client({
    name: "roborock-mcp-server-test",
    version: "0.0.0",
  });

  beforeAll(async () => {
    // Only the SDK's safe default environment is passed, so ROBOROCK_* are
    // unset and the Python bridge exits before contacting the Roborock cloud.
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["run", entrypoint],
      env: getDefaultEnvironment(),
      stderr: "ignore",
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

  test("publishes the expected input schemas", async () => {
    const { tools } = await client.listTools();
    const byName = new Map(tools.map((tool) => [tool.name, tool]));

    const status = byName.get("vacuum_status")?.inputSchema;
    expect(status?.properties).toHaveProperty("device_id");
    expect(status?.required ?? []).toEqual([]);

    const zone = byName.get("zone_clean")?.inputSchema;
    expect(zone?.required).toEqual(["zones"]);
    expect(zone?.properties?.zones).toMatchObject({
      type: "array",
      items: { type: "array", minItems: 4, maxItems: 4 },
    });

    expect(byName.get("room_clean")?.inputSchema.required).toEqual([
      "room_ids",
    ]);
  });

  test("returns an error result when the Python bridge fails", async () => {
    // Without credentials the spawned Python process cannot succeed, so this
    // exercises the subprocess path and its error handling end to end.
    const result = (await client.callTool({
      name: "vacuum_status",
      arguments: {},
    })) as CallToolResult;
    expect(result.isError).toBe(true);
    const text = firstText(result);
    expect(text).toContain("Error getting vacuum status");
    // python-roborock is imported as `roborock`; `python_roborock` never existed.
    expect(text).not.toContain("python_roborock");
  }, 30_000);

  test("rejects arguments that do not match the input schema", async () => {
    const result = (await client.callTool({
      name: "zone_clean",
      arguments: { zones: [[1, 2, 3]] },
    })) as CallToolResult;
    expect(result.isError).toBe(true);
    expect(firstText(result)).toContain("Input validation error");
  });

  test("rejects unknown tools", async () => {
    const result = (await client.callTool({
      name: "no_such_tool",
    })) as CallToolResult;
    expect(result.isError).toBe(true);
    expect(firstText(result)).toContain("Tool no_such_tool not found");
  });
});
