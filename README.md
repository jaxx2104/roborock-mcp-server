# Roborock MCP Server

A Model Context Protocol (MCP) server for controlling Roborock vacuum cleaners,
enabling Claude to interact with and control your robot vacuum.

## Features

- Check vacuum status
- Start/stop/pause cleaning
- Return to dock
- Locate vacuum (play sound)
- Get map data
- Zone cleaning
- Room-specific cleaning

## Prerequisites

- Deno 1.37+
- Python 3.8+
- python-roborock package

## Installation

### Install Python Dependencies

```bash
pip install python-roborock
```

### Environment Variables

Set your Roborock account credentials:

```bash
export ROBOROCK_USERNAME="your-roborock-username"
export ROBOROCK_PASSWORD="your-roborock-password"
```

Or copy `.env.example` to `.env` and fill in your credentials.

## Usage

### Start the Server

```bash
deno task start
```

### Development Mode

```bash
deno task dev
```

## Available Tools

### vacuum_status

Get the current status of the vacuum.

```json
{
  "name": "vacuum_status",
  "arguments": {
    "device_id": "optional-device-id"
  }
}
```

### start_cleaning

Start cleaning operation.

```json
{
  "name": "start_cleaning",
  "arguments": {
    "device_id": "optional-device-id"
  }
}
```

### stop_cleaning

Stop the current cleaning operation.

```json
{
  "name": "stop_cleaning",
  "arguments": {
    "device_id": "optional-device-id"
  }
}
```

### pause_cleaning

Pause the current cleaning operation.

```json
{
  "name": "pause_cleaning",
  "arguments": {
    "device_id": "optional-device-id"
  }
}
```

### return_to_dock

Send the vacuum back to its charging dock.

```json
{
  "name": "return_to_dock",
  "arguments": {
    "device_id": "optional-device-id"
  }
}
```

### locate_vacuum

Play a sound to locate the vacuum.

```json
{
  "name": "locate_vacuum",
  "arguments": {
    "device_id": "optional-device-id"
  }
}
```

### get_map

Retrieve map data from the vacuum.

```json
{
  "name": "get_map",
  "arguments": {
    "device_id": "optional-device-id"
  }
}
```

### zone_clean

Clean specific zones defined by coordinates.

```json
{
  "name": "zone_clean",
  "arguments": {
    "device_id": "optional-device-id",
    "zones": [[x1, y1, x2, y2], [x3, y3, x4, y4]]
  }
}
```

### room_clean

Clean specific rooms by room IDs.

```json
{
  "name": "room_clean",
  "arguments": {
    "device_id": "optional-device-id",
    "room_ids": ["room1", "room2"]
  }
}
```

## Claude Desktop Configuration

To use with Claude Desktop, add the following to your
`claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "roborock": {
      "command": "deno",
      "args": [
        "run",
        "--allow-net",
        "--allow-read",
        "--allow-env",
        "/path/to/roborock-mcp/src/index.ts"
      ],
      "env": {
        "ROBOROCK_USERNAME": "your-username",
        "ROBOROCK_PASSWORD": "your-password"
      }
    }
  }
}
```

## Notes

- You must set the `ROBOROCK_USERNAME` and `ROBOROCK_PASSWORD` environment
  variables
- If you have multiple devices, the first device will be used by default
- Some newer Roborock models (Q10, Q7, etc.) may not be supported depending on
  the python-roborock library compatibility

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
