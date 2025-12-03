import { readFileSync, existsSync } from 'fs';
import { resolve, basename, extname } from 'path';
import { Logger } from '../utils/logger.util.js';
import latitudeService from '../services/vendor.latitude.service.js';
import { handleControllerError, buildErrorContext } from '../utils/error-handler.util.js';
import { applyJqFilter, toOutputString } from '../utils/jq.util.js';
import { DocumentChange } from '../types/latitude.types.js';

/**
 * Derive prompt path from filename
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

/**
 * Output format type
 */
type OutputFormat = 'toon' | 'json';

/**
 * Controller response type
 */
interface ControllerResponse {
	content: string;
}

/**
 * Common controller options
 */
interface ControllerOptions {
	jq?: string;
	outputFormat?: OutputFormat;
}

/**
 * Format output data consistently
 */
async function formatOutput(
	data: unknown,
	options: ControllerOptions = {},
): Promise<ControllerResponse> {
	const filteredData = applyJqFilter(data, options.jq);
	const useToon = options.outputFormat !== 'json';
	const content = await toOutputString(filteredData, useToon);
	return { content };
}

// ============================================================================
// Projects Controller
// ============================================================================

async function listProjects(
	options: ControllerOptions = {},
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'listProjects',
	);
	methodLogger.debug('Listing all projects');

	try {
		const projects = await latitudeService.listProjects();
		return formatOutput(projects, options);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'listProjects',
				'controllers/latitude.controller.ts@listProjects',
				'projects',
				{},
			),
		);
	}
}

async function createProject(
	args: { name: string } & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'createProject',
	);
	methodLogger.debug(`Creating project: ${args.name}`);

	try {
		const project = await latitudeService.createProject(args.name);
		return formatOutput(project, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'createProject',
				'controllers/latitude.controller.ts@createProject',
				args.name,
				{ args },
			),
		);
	}
}

// ============================================================================
// Versions Controller
// ============================================================================

async function listVersions(
	args: { projectId: string } & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'listVersions',
	);
	methodLogger.debug(`Listing versions for project: ${args.projectId}`);

	try {
		const versions = await latitudeService.listVersions(args.projectId);
		return formatOutput(versions, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'listVersions',
				'controllers/latitude.controller.ts@listVersions',
				args.projectId,
				{ args },
			),
		);
	}
}

async function getVersion(
	args: { projectId: string; versionUuid: string } & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'getVersion',
	);
	methodLogger.debug(`Getting version: ${args.versionUuid}`);

	try {
		const version = await latitudeService.getVersion(
			args.projectId,
			args.versionUuid,
		);
		return formatOutput(version, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'getVersion',
				'controllers/latitude.controller.ts@getVersion',
				args.versionUuid,
				{ args },
			),
		);
	}
}

async function createVersion(
	args: { projectId: string; name: string } & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'createVersion',
	);
	methodLogger.debug(`Creating version: ${args.name}`);

	try {
		const version = await latitudeService.createVersion(
			args.projectId,
			args.name,
		);
		return formatOutput(version, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'createVersion',
				'controllers/latitude.controller.ts@createVersion',
				args.name,
				{ args },
			),
		);
	}
}

async function publishVersion(
	args: {
		projectId: string;
		versionUuid: string;
		title?: string;
		description?: string;
	} & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'publishVersion',
	);
	methodLogger.debug(`Publishing version: ${args.versionUuid}`);

	try {
		const version = await latitudeService.publishVersion(
			args.projectId,
			args.versionUuid,
			{ title: args.title, description: args.description },
		);
		return formatOutput(version, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'publishVersion',
				'controllers/latitude.controller.ts@publishVersion',
				args.versionUuid,
				{ args },
			),
		);
	}
}

async function pushChanges(
	args: {
		projectId: string;
		versionUuid: string;
		changes: DocumentChange[];
	} & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'pushChanges',
	);
	methodLogger.debug(`Pushing ${args.changes.length} changes`);

	try {
		const result = await latitudeService.pushChanges(
			args.projectId,
			args.versionUuid,
			{ changes: args.changes },
		);
		return formatOutput(result, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'pushChanges',
				'controllers/latitude.controller.ts@pushChanges',
				args.versionUuid,
				{ args },
			),
		);
	}
}

// ============================================================================
// Documents/Prompts Controller
// ============================================================================

async function listPrompts(
	args: { projectId: string; versionUuid: string } & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'listPrompts',
	);
	methodLogger.debug(`Listing prompts for version: ${args.versionUuid}`);

	try {
		const documents = await latitudeService.listDocuments(
			args.projectId,
			args.versionUuid,
		);
		return formatOutput(documents, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'listPrompts',
				'controllers/latitude.controller.ts@listPrompts',
				args.versionUuid,
				{ args },
			),
		);
	}
}

async function getPrompt(
	args: {
		projectId: string;
		versionUuid: string;
		path: string;
	} & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'getPrompt',
	);
	methodLogger.debug(`Getting prompt: ${args.path}`);

	try {
		const document = await latitudeService.getDocument(
			args.projectId,
			args.versionUuid,
			args.path,
		);
		return formatOutput(document, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'getPrompt',
				'controllers/latitude.controller.ts@getPrompt',
				args.path,
				{ args },
			),
		);
	}
}

async function pushPrompt(
	args: {
		projectId: string;
		versionUuid: string;
		path: string;
		content: string;
		force?: boolean;
	} & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'pushPrompt',
	);
	methodLogger.debug(`Pushing prompt: ${args.path}`);

	try {
		const document = await latitudeService.createOrUpdateDocument(
			args.projectId,
			args.versionUuid,
			args.path,
			args.content,
			args.force,
		);
		return formatOutput(document, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'pushPrompt',
				'controllers/latitude.controller.ts@pushPrompt',
				args.path,
				{ args },
			),
		);
	}
}

async function pushPromptFromFile(
	args: {
		projectId: string;
		versionUuid: string;
		filePath: string;
		promptPath?: string;
		force?: boolean;
	} & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'pushPromptFromFile',
	);

	// Resolve and validate file path
	const absolutePath = resolve(args.filePath);
	if (!existsSync(absolutePath)) {
		throw new Error(`File not found: ${absolutePath}`);
	}

	// Read file content
	const content = readFileSync(absolutePath, 'utf-8');

	// Derive prompt path from filename if not provided
	const promptPath = args.promptPath || derivePromptPath(args.filePath);

	methodLogger.debug(`Pushing prompt from file: ${absolutePath} → ${promptPath}`);

	try {
		const document = await latitudeService.createOrUpdateDocument(
			args.projectId,
			args.versionUuid,
			promptPath,
			content,
			args.force,
		);

		// Include file info in response
		const result = {
			...document,
			_meta: {
				sourceFile: absolutePath,
				promptPath,
				contentLength: content.length,
			},
		};

		return formatOutput(result, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'pushPromptFromFile',
				'controllers/latitude.controller.ts@pushPromptFromFile',
				absolutePath,
				{ args },
			),
		);
	}
}

async function runPrompt(
	args: {
		projectId: string;
		versionUuid: string;
		path: string;
		parameters?: Record<string, unknown>;
		stream?: boolean;
		tools?: string[];
		userMessage?: string;
	} & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'runPrompt',
	);
	methodLogger.debug(`Running prompt: ${args.path}`);

	try {
		const result = await latitudeService.runDocument(
			args.projectId,
			args.versionUuid,
			{
				path: args.path,
				parameters: args.parameters,
				stream: args.stream,
				tools: args.tools,
				userMessage: args.userMessage,
			},
		);

		// Handle streaming response
		if (args.stream && result && typeof result === 'object' && Symbol.asyncIterator in result) {
			const chunks: string[] = [];
			for await (const chunk of result as AsyncIterable<string>) {
				chunks.push(chunk);
			}
			return { content: chunks.join('') };
		}

		return formatOutput(result, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'runPrompt',
				'controllers/latitude.controller.ts@runPrompt',
				args.path,
				{ args },
			),
		);
	}
}

async function createLog(
	args: {
		projectId: string;
		versionUuid: string;
		path: string;
		messages: Array<{ role: string; content: string }>;
	} & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'createLog',
	);
	methodLogger.debug(`Creating log for: ${args.path}`);

	try {
		const result = await latitudeService.createDocumentLog(
			args.projectId,
			args.versionUuid,
			args.path,
			args.messages,
		);
		return formatOutput(result, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'createLog',
				'controllers/latitude.controller.ts@createLog',
				args.path,
				{ args },
			),
		);
	}
}

// ============================================================================
// Conversations Controller
// ============================================================================

async function getConversation(
	args: { conversationUuid: string } & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'getConversation',
	);
	methodLogger.debug(`Getting conversation: ${args.conversationUuid}`);

	try {
		const conversation = await latitudeService.getConversation(
			args.conversationUuid,
		);
		return formatOutput(conversation, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'getConversation',
				'controllers/latitude.controller.ts@getConversation',
				args.conversationUuid,
				{ args },
			),
		);
	}
}

async function chat(
	args: {
		conversationUuid: string;
		message: string;
		stream?: boolean;
	} & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'chat',
	);
	methodLogger.debug(`Chatting in conversation: ${args.conversationUuid}`);

	try {
		const messages = [{ role: 'user', content: args.message }];
		const result = await latitudeService.chatConversation(
			args.conversationUuid,
			messages,
			args.stream,
		);

		// Handle streaming response
		if (args.stream && result && typeof result === 'object' && Symbol.asyncIterator in result) {
			const chunks: string[] = [];
			for await (const chunk of result as AsyncIterable<string>) {
				chunks.push(chunk);
			}
			return { content: chunks.join('') };
		}

		return formatOutput(result, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'chat',
				'controllers/latitude.controller.ts@chat',
				args.conversationUuid,
				{ args },
			),
		);
	}
}

async function stopConversation(
	args: { conversationUuid: string } & ControllerOptions,
): Promise<ControllerResponse> {
	const methodLogger = Logger.forContext(
		'controllers/latitude.controller.ts',
		'stopConversation',
	);
	methodLogger.debug(`Stopping conversation: ${args.conversationUuid}`);

	try {
		const result = await latitudeService.stopConversation(args.conversationUuid);
		return formatOutput(result, args);
	} catch (error) {
		throw handleControllerError(
			error,
			buildErrorContext(
				'Latitude',
				'stopConversation',
				'controllers/latitude.controller.ts@stopConversation',
				args.conversationUuid,
				{ args },
			),
		);
	}
}

// ============================================================================
// Export Controller
// ============================================================================

export default {
	// Projects
	listProjects,
	createProject,

	// Versions
	listVersions,
	getVersion,
	createVersion,
	publishVersion,
	pushChanges,

	// Documents/Prompts
	listPrompts,
	getPrompt,
	pushPrompt,
	pushPromptFromFile,
	runPrompt,
	createLog,

	// Conversations
	getConversation,
	chat,
	stopConversation,
};
