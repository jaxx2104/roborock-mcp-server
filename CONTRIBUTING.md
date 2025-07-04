# Contributing to Roborock MCP Server

Thank you for your interest in contributing to the Roborock MCP Server! This document provides guidelines for contributing to the project.

## Development Setup

1. **Prerequisites**
   - Deno 1.37+
   - Python 3.8+
   - python-roborock package

2. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/roborock-mcp.git
   cd roborock-mcp
   ```

3. **Install dependencies**
   ```bash
   pip install python-roborock
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Roborock credentials
   ```

5. **Run the server**
   ```bash
   deno task dev
   ```

## Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add appropriate error handling
   - Update documentation if needed

3. **Test your changes**
   ```bash
   deno task start
   # Test the MCP server with Claude Desktop
   ```

4. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```

## Code Guidelines

- **TypeScript**: Use strict TypeScript with proper type annotations
- **Error Handling**: Always handle errors gracefully and provide meaningful error messages
- **Logging**: Use console.error for debugging information sent to stderr
- **Security**: Never log or expose sensitive information like credentials

## Pull Request Process

1. Update the README.md if you're adding new features
2. Update the CLAUDE.md if you're changing the architecture
3. Ensure your code follows the existing patterns
4. Submit a pull request with a clear description of your changes

## Reporting Issues

When reporting issues, please include:
- Your operating system and version
- Deno version
- Python version
- Steps to reproduce the issue
- Expected vs actual behavior
- Any error messages

## Feature Requests

Before submitting a feature request, please check if it's already been requested. When submitting:
- Describe the feature in detail
- Explain the use case
- Consider the impact on existing functionality

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to improve the project together.