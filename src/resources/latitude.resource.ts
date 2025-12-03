import {
	McpServer,
	ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../utils/logger.util.js';
import latitudeController from '../controllers/latitude.controller.js';
import { formatErrorForMcpResource } from '../utils/error.util.js';

const logger = Logger.forContext('resources/latitude.resource.ts');

/**
 * Register Latitude resources with the MCP server
 * Resources provide read-only access to Latitude data
 *
 * @param server The MCP server instance
 */
function registerResources(server: McpServer) {
	const registerLogger = logger.forMethod('registerResources');
	registerLogger.debug('Registering Latitude resources...');

	// Projects resource - list all projects
	server.registerResource(
		'latitude-projects',
		new ResourceTemplate('latitude://projects', { list: undefined }),
		{
			title: 'Latitude Projects',
			description: 'List all projects in your Latitude workspace',
		},
		async (uri) => {
			const methodLogger = logger.forMethod('projectsResource');
			try {
				methodLogger.debug('Projects resource called', { uri: uri.href });

				const result = await latitudeController.listProjects();

				return {
					contents: [
						{
							uri: uri.href,
							text: result.content,
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				methodLogger.error('Resource error', error);
				return formatErrorForMcpResource(error, uri.href);
			}
		},
	);

	// Versions resource - list versions for a project
	server.registerResource(
		'latitude-versions',
		new ResourceTemplate('latitude://projects/{projectId}/versions', {
			list: undefined,
		}),
		{
			title: 'Project Versions',
			description: 'List all versions (commits) for a Latitude project',
		},
		async (uri, variables) => {
			const methodLogger = logger.forMethod('versionsResource');
			try {
				const projectId = variables.projectId as string;
				methodLogger.debug('Versions resource called', {
					uri: uri.href,
					projectId,
				});

				const result = await latitudeController.listVersions({ projectId });

				return {
					contents: [
						{
							uri: uri.href,
							text: result.content,
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				methodLogger.error('Resource error', error);
				return formatErrorForMcpResource(error, uri.href);
			}
		},
	);

	// Prompts resource - list prompts for a version
	server.registerResource(
		'latitude-prompts',
		new ResourceTemplate(
			'latitude://projects/{projectId}/versions/{versionUuid}/prompts',
			{ list: undefined },
		),
		{
			title: 'Version Prompts',
			description: 'List all prompts/documents in a Latitude project version',
		},
		async (uri, variables) => {
			const methodLogger = logger.forMethod('promptsResource');
			try {
				const projectId = variables.projectId as string;
				const versionUuid = (variables.versionUuid as string) || 'live';
				methodLogger.debug('Prompts resource called', {
					uri: uri.href,
					projectId,
					versionUuid,
				});

				const result = await latitudeController.listPrompts({
					projectId,
					versionUuid,
				});

				return {
					contents: [
						{
							uri: uri.href,
							text: result.content,
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				methodLogger.error('Resource error', error);
				return formatErrorForMcpResource(error, uri.href);
			}
		},
	);

	// Single prompt resource - get a specific prompt
	server.registerResource(
		'latitude-prompt',
		new ResourceTemplate(
			'latitude://projects/{projectId}/versions/{versionUuid}/prompts/{path}',
			{ list: undefined },
		),
		{
			title: 'Prompt Content',
			description: 'Get a specific prompt by path from a Latitude project',
		},
		async (uri, variables) => {
			const methodLogger = logger.forMethod('promptResource');
			try {
				const projectId = variables.projectId as string;
				const versionUuid = (variables.versionUuid as string) || 'live';
				const path = variables.path as string;
				methodLogger.debug('Prompt resource called', {
					uri: uri.href,
					projectId,
					versionUuid,
					path,
				});

				const result = await latitudeController.getPrompt({
					projectId,
					versionUuid,
					path,
				});

				return {
					contents: [
						{
							uri: uri.href,
							text: result.content,
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				methodLogger.error('Resource error', error);
				return formatErrorForMcpResource(error, uri.href);
			}
		},
	);

	registerLogger.debug('Latitude resources registered successfully');
}

export default { registerResources };
