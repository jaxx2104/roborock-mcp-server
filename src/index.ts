#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";

class RoborockMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "roborock-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "vacuum_status":
          return this.getVacuumStatus(args);
        case "start_cleaning":
          return this.startCleaning(args);
        case "stop_cleaning":
          return this.stopCleaning(args);
        case "pause_cleaning":
          return this.pauseCleaning(args);
        case "return_to_dock":
          return this.returnToDock(args);
        case "locate_vacuum":
          return this.locateVacuum(args);
        case "get_map":
          return this.getMap(args);
        case "zone_clean":
          return this.zoneClean(args);
        case "room_clean":
          return this.roomClean(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: "vacuum_status",
        description: "Get the current status of the Roborock vacuum",
        inputSchema: {
          type: "object",
          properties: {
            device_id: {
              type: "string",
              description:
                "Device ID of the vacuum (optional if only one device)",
            },
          },
        },
      },
      {
        name: "start_cleaning",
        description: "Start cleaning with the vacuum",
        inputSchema: {
          type: "object",
          properties: {
            device_id: {
              type: "string",
              description:
                "Device ID of the vacuum (optional if only one device)",
            },
          },
        },
      },
      {
        name: "stop_cleaning",
        description: "Stop the current cleaning operation",
        inputSchema: {
          type: "object",
          properties: {
            device_id: {
              type: "string",
              description:
                "Device ID of the vacuum (optional if only one device)",
            },
          },
        },
      },
      {
        name: "pause_cleaning",
        description: "Pause the current cleaning operation",
        inputSchema: {
          type: "object",
          properties: {
            device_id: {
              type: "string",
              description:
                "Device ID of the vacuum (optional if only one device)",
            },
          },
        },
      },
      {
        name: "return_to_dock",
        description: "Send the vacuum back to its charging dock",
        inputSchema: {
          type: "object",
          properties: {
            device_id: {
              type: "string",
              description:
                "Device ID of the vacuum (optional if only one device)",
            },
          },
        },
      },
      {
        name: "locate_vacuum",
        description: "Play a sound to locate the vacuum",
        inputSchema: {
          type: "object",
          properties: {
            device_id: {
              type: "string",
              description:
                "Device ID of the vacuum (optional if only one device)",
            },
          },
        },
      },
      {
        name: "get_map",
        description: "Get the current map from the vacuum",
        inputSchema: {
          type: "object",
          properties: {
            device_id: {
              type: "string",
              description:
                "Device ID of the vacuum (optional if only one device)",
            },
          },
        },
      },
      {
        name: "zone_clean",
        description: "Clean specific zones",
        inputSchema: {
          type: "object",
          properties: {
            device_id: {
              type: "string",
              description:
                "Device ID of the vacuum (optional if only one device)",
            },
            zones: {
              type: "array",
              description: "Array of zone coordinates [x1, y1, x2, y2]",
              items: {
                type: "array",
                items: { type: "number" },
                minItems: 4,
                maxItems: 4,
              },
            },
          },
          required: ["zones"],
        },
      },
      {
        name: "room_clean",
        description: "Clean specific rooms",
        inputSchema: {
          type: "object",
          properties: {
            device_id: {
              type: "string",
              description:
                "Device ID of the vacuum (optional if only one device)",
            },
            room_ids: {
              type: "array",
              description: "Array of room IDs to clean",
              items: { type: "string" },
            },
          },
          required: ["room_ids"],
        },
      },
    ];
  }

  private async getVacuumStatus(args: any) {
    try {
      const deviceId = args?.device_id || "default";

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

  private async startCleaning(args: any) {
    try {
      const deviceId = args?.device_id || "default";

      const result = await this.executeRoborockCommand(
        "start_cleaning",
        deviceId,
      );

      return {
        content: [
          {
            type: "text",
            text: `Cleaning started successfully. Result: ${
              JSON.stringify(result)
            }`,
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

  private async stopCleaning(args: any) {
    try {
      const deviceId = args?.device_id || "default";

      const result = await this.executeRoborockCommand(
        "stop_cleaning",
        deviceId,
      );

      return {
        content: [
          {
            type: "text",
            text: `Cleaning stopped successfully. Result: ${
              JSON.stringify(result)
            }`,
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

  private async pauseCleaning(args: any) {
    try {
      const deviceId = args?.device_id || "default";

      const result = await this.executeRoborockCommand(
        "pause_cleaning",
        deviceId,
      );

      return {
        content: [
          {
            type: "text",
            text: `Cleaning paused successfully. Result: ${
              JSON.stringify(result)
            }`,
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

  private async returnToDock(args: any) {
    try {
      const deviceId = args?.device_id || "default";

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

  private async locateVacuum(args: any) {
    try {
      const deviceId = args?.device_id || "default";

      const result = await this.executeRoborockCommand("find_robot", deviceId);

      return {
        content: [
          {
            type: "text",
            text: `Locate command sent successfully. Result: ${
              JSON.stringify(result)
            }`,
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

  private async getMap(args: any) {
    try {
      const deviceId = args?.device_id || "default";

      const result = await this.executeRoborockCommand("get_map", deviceId);

      return {
        content: [
          {
            type: "text",
            text: `Map data retrieved. Result: ${
              JSON.stringify(result, null, 2)
            }`,
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

  private async zoneClean(args: any) {
    try {
      const deviceId = args?.device_id || "default";
      const zones = args.zones;

      const result = await this.executeRoborockCommand("zone_clean", deviceId, {
        zones,
      });

      return {
        content: [
          {
            type: "text",
            text: `Zone cleaning started. Zones: ${
              JSON.stringify(zones)
            }. Result: ${JSON.stringify(result)}`,
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

  private async roomClean(args: any) {
    try {
      const deviceId = args?.device_id || "default";
      const roomIds = args.room_ids;

      const result = await this.executeRoborockCommand("room_clean", deviceId, {
        room_ids: roomIds,
      });

      return {
        content: [
          {
            type: "text",
            text: `Room cleaning started. Rooms: ${
              JSON.stringify(roomIds)
            }. Result: ${JSON.stringify(result)}`,
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

    const process = new Deno.Command("python3", {
      args: ["-c", pythonScript],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await process.output();

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      throw new Error(`Python script failed: ${errorText}`);
    }

    const output = new TextDecoder().decode(stdout);
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
from python_roborock import RoborockClient

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
