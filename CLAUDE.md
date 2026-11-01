# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Development Commands

Runtime is Bun, version-managed by mise (`mise.toml` / `mise.lock`).

- Install dependencies: `bun install`
- Start the server: `bun run start`
- Development mode with auto-reload: `bun run dev`
- Direct execution: `bun run src/index.ts`
- Type check: `bun run check` (`tsc --noEmit`)
- Lint / format: `bun run lint` / `bun run fmt` (Biome; `bun run ci` checks both)
- Tests: `bun test` (`bun:test`, files under `test/`)

## Architecture

This is a **Model Context Protocol (MCP) server** that provides Claude with the
ability to control Roborock vacuum cleaners. The architecture consists of:

- **MCP Server Layer** (`src/index.ts`): TypeScript/Bun server implementing the
  MCP protocol
- **Python Integration Layer**: Executes Python scripts using the
  `python-roborock` library
- **Roborock API Layer**: Communicates with Roborock cloud services via Python

### Key Components

- **RoborockMCPServer class**: Main server implementation with 9 vacuum control
  tools
- **Tool handlers**: Each vacuum operation (status, cleaning, navigation) has
  its own handler
- **Python script generation**: Dynamically generates Python scripts for each
  operation
- **Command execution**: Uses `Bun.spawn` to execute Python scripts and parse
  JSON responses

### Tool Architecture

All tools follow the same pattern:

1. Parse arguments (device_id is optional, defaults to first device)
2. Generate Python script with embedded command and parameters
3. Execute Python script with proper error handling
4. Parse JSON response or return error

## Environment Setup

Required environment variables:

- `ROBOROCK_USERNAME`: Your Roborock account username
- `ROBOROCK_PASSWORD`: Your Roborock account password

Required external dependencies:

- Python 3.8+ with `python-roborock` package installed
- Bun (see `mise.toml`)

## Available Tools

The server provides 9 vacuum control tools:

- `vacuum_status`: Get current vacuum status
- `start_cleaning`, `stop_cleaning`, `pause_cleaning`: Basic cleaning controls
- `return_to_dock`: Send vacuum home
- `locate_vacuum`: Play sound to find vacuum
- `get_map`: Retrieve map data
- `zone_clean`: Clean specific coordinate zones
- `room_clean`: Clean specific room IDs

## Integration Notes

- This server is designed to be used with Claude Desktop via MCP configuration
- All Python execution happens in child processes for isolation
- Error handling includes both Python script errors and JSON parsing failures
- Device selection defaults to first device if no device_id specified
