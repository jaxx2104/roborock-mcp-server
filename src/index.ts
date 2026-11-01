#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const deviceIdSchema = z
  .string()
  .optional()
  .describe("Device ID of the vacuum (optional if only one device)");

type DeviceArgs = { device_id?: string };

class RoborockMCPServer {
  private server: McpServer;

  constructor() {
    this.server = new McpServer({
      name: "roborock-mcp-server",
      version: "1.0.0",
    });

    this.registerTools();
  }

  private registerTools(): void {
    const deviceOnlyTools: Array<{
      name: string;
      description: string;
      handler: (args: DeviceArgs) => Promise<CallToolResult>;
    }> = [
      {
        name: "vacuum_status",
        description: "Get the current status of the Roborock vacuum",
        handler: (args) => this.getVacuumStatus(args),
      },
      {
        name: "start_cleaning",
        description: "Start cleaning with the vacuum",
        handler: (args) => this.startCleaning(args),
      },
      {
        name: "stop_cleaning",
        description: "Stop the current cleaning operation",
        handler: (args) => this.stopCleaning(args),
      },
      {
        name: "pause_cleaning",
        description: "Pause the current cleaning operation",
        handler: (args) => this.pauseCleaning(args),
      },
      {
        name: "return_to_dock",
        description: "Send the vacuum back to its charging dock",
        handler: (args) => this.returnToDock(args),
      },
      {
        name: "locate_vacuum",
        description: "Play a sound to locate the vacuum",
        handler: (args) => this.locateVacuum(args),
      },
      {
        name: "get_map",
        description: "Get the current map from the vacuum",
        handler: (args) => this.getMap(args),
      },
    ];

    for (const { name, description, handler } of deviceOnlyTools) {
      this.server.registerTool(
        name,
        { description, inputSchema: { device_id: deviceIdSchema } },
        handler,
      );
    }

    this.server.registerTool(
      "zone_clean",
      {
        description: "Clean specific zones",
        inputSchema: {
          device_id: deviceIdSchema,
          zones: z
            .array(z.array(z.number()).min(4).max(4))
            .describe("Array of zone coordinates [x1, y1, x2, y2]"),
        },
      },
      (args) => this.zoneClean(args),
    );

    this.server.registerTool(
      "room_clean",
      {
        description: "Clean specific rooms",
        inputSchema: {
          device_id: deviceIdSchema,
          room_ids: z.array(z.string()).describe("Array of room IDs to clean"),
        },
      },
      (args) => this.roomClean(args),
    );
  }

  private async getVacuumStatus(args: DeviceArgs): Promise<CallToolResult> {
    try {
      const deviceId = args.device_id || "default";

      const status = await this.executeRoborockCommand("get_status", deviceId);

      return {
        content: [
          {
            type: "text",
            text: `Vacuum Status:\n${JSON.stringify(status, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting vacuum status: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async startCleaning(args: DeviceArgs): Promise<CallToolResult> {
    try {
      const deviceId = args.device_id || "default";

      const result = await this.executeRoborockCommand(
        "start_cleaning",
        deviceId,
      );

      return {
        content: [
          {
            type: "text",
            text: `Cleaning started successfully. Result: ${JSON.stringify(
              result,
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error starting cleaning: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async stopCleaning(args: DeviceArgs): Promise<CallToolResult> {
    try {
      const deviceId = args.device_id || "default";

      const result = await this.executeRoborockCommand(
        "stop_cleaning",
        deviceId,
      );

      return {
        content: [
          {
            type: "text",
            text: `Cleaning stopped successfully. Result: ${JSON.stringify(
              result,
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error stopping cleaning: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async pauseCleaning(args: DeviceArgs): Promise<CallToolResult> {
    try {
      const deviceId = args.device_id || "default";

      const result = await this.executeRoborockCommand(
        "pause_cleaning",
        deviceId,
      );

      return {
        content: [
          {
            type: "text",
            text: `Cleaning paused successfully. Result: ${JSON.stringify(
              result,
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error pausing cleaning: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async returnToDock(args: DeviceArgs): Promise<CallToolResult> {
    try {
      const deviceId = args.device_id || "default";

      const result = await this.executeRoborockCommand(
        "return_to_dock",
        deviceId,
      );

      return {
        content: [
          {
            type: "text",
            text: `Vacuum returning to dock. Result: ${JSON.stringify(result)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error returning to dock: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async locateVacuum(args: DeviceArgs): Promise<CallToolResult> {
    try {
      const deviceId = args.device_id || "default";

      const result = await this.executeRoborockCommand("find_robot", deviceId);

      return {
        content: [
          {
            type: "text",
            text: `Locate command sent successfully. Result: ${JSON.stringify(
              result,
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error locating vacuum: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async getMap(args: DeviceArgs): Promise<CallToolResult> {
    try {
      const deviceId = args.device_id || "default";

      const result = await this.executeRoborockCommand("get_map", deviceId);

      return {
        content: [
          {
            type: "text",
            text: `Map data retrieved. Result: ${JSON.stringify(
              result,
              null,
              2,
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting map: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async zoneClean(
    args: DeviceArgs & { zones: number[][] },
  ): Promise<CallToolResult> {
    try {
      const deviceId = args.device_id || "default";
      const zones = args.zones;

      const result = await this.executeRoborockCommand("zone_clean", deviceId, {
        zones,
      });

      return {
        content: [
          {
            type: "text",
            text: `Zone cleaning started. Zones: ${JSON.stringify(
              zones,
            )}. Result: ${JSON.stringify(result)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error starting zone cleaning: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async roomClean(
    args: DeviceArgs & { room_ids: string[] },
  ): Promise<CallToolResult> {
    try {
      const deviceId = args.device_id || "default";
      const roomIds = args.room_ids;

      const result = await this.executeRoborockCommand("room_clean", deviceId, {
        room_ids: roomIds,
      });

      return {
        content: [
          {
            type: "text",
            text: `Room cleaning started. Rooms: ${JSON.stringify(
              roomIds,
            )}. Result: ${JSON.stringify(result)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error starting room cleaning: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async executeRoborockCommand(
    command: string,
    deviceId: string,
    params?: any,
  ): Promise<any> {
    const pythonScript = this.generatePythonScript(command, deviceId, params);

    const proc = Bun.spawn(["python3", "-c", pythonScript], {
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
    });

    const [output, errorText, code] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    if (code !== 0) {
      throw new Error(`Python script failed: ${errorText}`);
    }

    try {
      return JSON.parse(output);
    } catch {
      return { output: output.trim() };
    }
  }

  private generatePythonScript(
    command: string,
    _deviceId: string,
    params?: any,
  ): string {
    const paramsJson = params ? JSON.stringify(params) : "{}";

    return `
import asyncio
import json
import os
from roborock import RoborockClient

async def main():
    try:
        username = os.environ.get('ROBOROCK_USERNAME')
        password = os.environ.get('ROBOROCK_PASSWORD')
        
        if not username or not password:
            raise Exception("ROBOROCK_USERNAME and ROBOROCK_PASSWORD environment variables must be set")
        
        client = RoborockClient(username, password)
        await client.async_connect()
        
        devices = await client.get_devices()
        if not devices:
            raise Exception("No devices found")
        
        device = devices[0]  # Use first device if device_id is "default"
        
        command = "${command}"
        params = json.loads('${paramsJson}')
        
        if command == "get_status":
            result = await device.get_status()
        elif command == "start_cleaning":
            result = await device.start_cleaning()
        elif command == "stop_cleaning":
            result = await device.stop_cleaning()
        elif command == "pause_cleaning":
            result = await device.pause_cleaning()
        elif command == "return_to_dock":
            result = await device.return_to_dock()
        elif command == "find_robot":
            result = await device.find_robot()
        elif command == "get_map":
            result = await device.get_map()
        elif command == "zone_clean":
            result = await device.zone_clean(params.get("zones", []))
        elif command == "room_clean":
            result = await device.room_clean(params.get("room_ids", []))
        else:
            raise Exception(f"Unknown command: {command}")
        
        print(json.dumps(result, default=str))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())
`;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error("Roborock MCP Server running on stdio");
  }
}

if (import.meta.main) {
  const server = new RoborockMCPServer();
  server.run().catch(console.error);
}
