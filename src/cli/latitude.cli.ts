import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve, basename, extname } from 'path';
import { Logger } from '../utils/logger.util.js';
import { handleCliError } from '../utils/error.util.js';
import latitudeController from '../controllers/latitude.controller.js';

/**
 * Read content from file path or stdin
 */
function readContentFromFile(filePath: string): string {
	const absolutePath = resolve(filePath);
	if (!existsSync(absolutePath)) {
		throw new Error(`File not found: ${absolutePath}`);
	}
	return readFileSync(absolutePath, 'utf-8');
}

/**
 * Derive prompt path from filename if not provided
 * e.g., "/path/to/my-prompt.md" → "my-prompt"
 */
function derivePromptPath(filePath: string): string {
	const base = basename(filePath);
	const ext = extname(base);
	// Remove .md, .promptl, .txt extensions
	if (['.md', '.promptl', '.txt'].includes(ext)) {
		return base.slice(0, -ext.length);
	}
	return base;
}

const logger = Logger.forContext('cli/latitude.cli.ts');

/**
 * Register Latitude CLI commands
 * @param program The Commander program instance
 */
function register(program: Command) {
	const methodLogger = logger.forMethod('register');
	methodLogger.debug('Registering Latitude CLI commands...');

	// Projects command group
	const projects = program
		.command('projects')
		.description('Manage Latitude projects');

	projects
		.command('list')
		.description('List all projects in your workspace')
		.option('-o, --output-format <format>', 'Output format: "toon" or "json"', 'toon')
		.action(async (options) => {
			try {
				const result = await latitudeController.listProjects({
					outputFormat: options.outputFormat,
				});
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	projects
		.command('create <name>')
		.description('Create a new project')
		.option('-o, --output-format <format>', 'Output format: "toon" or "json"', 'toon')
		.action(async (name, options) => {
			try {
				const result = await latitudeController.createProject({
					name,
					outputFormat: options.outputFormat,
				});
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Versions command group
	const versions = program
		.command('versions')
		.description('Manage project versions');

	versions
		.command('list <projectId>')
		.description('List all versions for a project')
		.option('-o, --output-format <format>', 'Output format: "toon" or "json"', 'toon')
		.action(async (projectId, options) => {
			try {
				const result = await latitudeController.listVersions({
					projectId,
					outputFormat: options.outputFormat,
				});
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	versions
		.command('create <projectId> <name>')
		.description('Create a new draft version')
		.option('-o, --output-format <format>', 'Output format: "toon" or "json"', 'toon')
		.action(async (projectId, name, options) => {
			try {
				const result = await latitudeController.createVersion({
					projectId,
					name,
					outputFormat: options.outputFormat,
				});
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	versions
		.command('publish <projectId> <versionUuid>')
		.description('Publish a draft version to make it live')
		.option('-t, --title <title>', 'Publication title')
		.option('-d, --description <description>', 'Publication description')
		.option('-o, --output-format <format>', 'Output format: "toon" or "json"', 'toon')
		.action(async (projectId, versionUuid, options) => {
			try {
				const result = await latitudeController.publishVersion({
					projectId,
					versionUuid,
					title: options.title,
					description: options.description,
					outputFormat: options.outputFormat,
				});
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Prompts command group
	const prompts = program
		.command('prompts')
		.description('Manage prompts/documents');

	prompts
		.command('list <projectId>')
		.description('List all prompts in a version')
		.option('-v, --version-uuid <versionUuid>', 'Version UUID (default: "live")', 'live')
		.option('-o, --output-format <format>', 'Output format: "toon" or "json"', 'toon')
		.action(async (projectId, options) => {
			try {
				const result = await latitudeController.listPrompts({
					projectId,
					versionUuid: options.versionUuid,
					outputFormat: options.outputFormat,
				});
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	prompts
		.command('get <projectId> <path>')
		.description('Get a specific prompt by path')
		.option('-v, --version-uuid <versionUuid>', 'Version UUID (default: "live")', 'live')
		.option('-o, --output-format <format>', 'Output format: "toon" or "json"', 'toon')
		.action(async (projectId, path, options) => {
			try {
				const result = await latitudeController.getPrompt({
					projectId,
					versionUuid: options.versionUuid,
					path,
					outputFormat: options.outputFormat,
				});
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Push command (standalone like git push)
	// Supports: --file path/to/prompt.md OR --content "inline content"
	program
		.command('push <projectId> <versionUuid> [promptPath]')
		.description(
			'Push a prompt to a draft version. Use --file to read from a file, or --content for inline.',
		)
		.option('-i, --file <filePath>', 'Read prompt content from file (supports .md, .promptl)')
		.option('-c, --content <content>', 'Prompt content in PromptL format (inline)')
		.option('-f, --force', 'Force overwrite if exists', false)
		.option('-o, --output-format <format>', 'Output format: "toon" or "json"', 'toon')
		.action(async (projectId: string, versionUuid: string, promptPath: string | undefined, options: Record<string, unknown>) => {
			try {
				let content: string;
				let finalPath: string;

				// Determine content source
				if (options.file) {
					// Read from file
					const filePath = options.file as string;
					content = readContentFromFile(filePath);
					// Use provided promptPath or derive from filename
					finalPath = promptPath || derivePromptPath(filePath);
					console.log(`Reading from: ${resolve(filePath as string)}`);
				} else if (options.content) {
					// Use inline content
					content = options.content as string;
					if (!promptPath) {
						console.error('Error: promptPath is required when using --content');
						process.exit(1);
					}
					finalPath = promptPath;
				} else {
					console.error('Error: Either --file or --content is required');
					console.error('  Example with file:    latitude-mcp push proj123 draft456 --file ./my-prompt.md');
					console.error('  Example with content: latitude-mcp push proj123 draft456 my-prompt --content "..."');
					process.exit(1);
				}

				const result = await latitudeController.pushPrompt({
					projectId,
					versionUuid,
					path: finalPath,
					content,
					force: options.force as boolean,
					outputFormat: options.outputFormat as 'toon' | 'json',
				});
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Run command (execute a prompt)
	program
		.command('run <projectId> <path>')
		.description('Execute a prompt and get AI response')
		.option('-v, --version-uuid <versionUuid>', 'Version UUID (default: "live")', 'live')
		.option('-p, --parameters <json>', 'Parameters as JSON object')
		.option('-m, --message <message>', 'Additional user message')
		.option('-s, --stream', 'Enable streaming response', false)
		.option('-o, --output-format <format>', 'Output format: "toon" or "json"', 'toon')
		.action(async (projectId, path, options) => {
			try {
				let parameters: Record<string, unknown> | undefined;
				if (options.parameters) {
					try {
						parameters = JSON.parse(options.parameters);
					} catch {
						console.error('Error: Invalid JSON in --parameters');
						process.exit(1);
					}
				}

				const result = await latitudeController.runPrompt({
					projectId,
					versionUuid: options.versionUuid,
					path,
					parameters,
					userMessage: options.message,
					stream: options.stream,
					outputFormat: options.outputFormat,
				});
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	// Chat command (continue conversation)
	program
		.command('chat <conversationUuid>')
		.description('Continue a conversation')
		.requiredOption('-m, --message <message>', 'User message to send')
		.option('-s, --stream', 'Enable streaming response', false)
		.option('-o, --output-format <format>', 'Output format: "toon" or "json"', 'toon')
		.action(async (conversationUuid, options) => {
			try {
				const result = await latitudeController.chat({
					conversationUuid,
					message: options.message,
					stream: options.stream,
					outputFormat: options.outputFormat,
				});
				console.log(result.content);
			} catch (error) {
				handleCliError(error);
			}
		});

	methodLogger.debug('Latitude CLI commands registered successfully');
}

export default { register };
