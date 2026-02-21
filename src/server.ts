/**
 * MCP Server Setup
 * Simplified server initialization and transport
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Logger } from './utils/logger.util.js';
import { config } from './utils/config.util.js';
import { registerTools } from './tools.js';

const logger = Logger.forContext('server.ts');

// ============================================================================
// Server Configuration
// ============================================================================

const SERVER_NAME = 'mcp-latitude-prompts';
const SERVER_VERSION = '3.1.0';

// ============================================================================
// Server Instance
// ============================================================================

let server: McpServer | null = null;

/**
 * Create and configure the MCP server
 */
export async function createServer(): Promise<McpServer> {
	logger.info(`Starting ${SERVER_NAME} v${SERVER_VERSION}`);

	// Load config
	config.load();

	// Create MCP server
	server = new McpServer({
		name: SERVER_NAME,
		version: SERVER_VERSION,
	});

	// Register tools
	await registerTools(server);

	logger.info('MCP server created successfully');
	return server;
}

/**
 * Start the server with stdio transport
 */
export async function startServer(): Promise<void> {
	try {
		const mcpServer = await createServer();

		// Setup stdio transport
		const transport = new StdioServerTransport();
		await mcpServer.connect(transport);

		logger.info('Server connected via stdio transport');
	} catch (error) {
		logger.error('Failed to start server', error);
		process.exit(1);
	}
}

/**
 * Graceful shutdown
 */
export function setupGracefulShutdown(): void {
	const shutdown = async (signal: string) => {
		logger.info(`Received ${signal}, shutting down gracefully...`);

		if (server) {
			try {
				await server.close();
				logger.info('Server closed');
			} catch (error) {
				logger.error('Error during shutdown', error);
			}
		}

		process.exit(0);
	};

	process.on('SIGINT', () => shutdown('SIGINT'));
	process.on('SIGTERM', () => shutdown('SIGTERM'));
}
