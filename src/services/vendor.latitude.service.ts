import { Logger } from '../utils/logger.util.js';
import { config } from '../utils/config.util.js';
import {
	createApiError,
	createAuthInvalidError,
	createUnexpectedError,
	McpError,
} from '../utils/error.util.js';
import {
	LATITUDE_BASE_URL,
	LATITUDE_API_VERSION,
} from '../utils/constants.util.js';
import {
	Project,
	ProjectListSchema,
	Version,
	VersionListSchema,
	VersionSchema,
	Document,
	DocumentListSchema,
	DocumentSchema,
	Conversation,
	PushChanges,
	LatitudeError,
	LatitudeErrorSchema,
	RequestOptions,
} from '../types/latitude.types.js';

// Create a contextualized logger for this file
const serviceLogger = Logger.forContext('services/vendor.latitude.service.ts');

// Log service initialization
serviceLogger.debug('Latitude API service initialized');

/**
 * Get Latitude API credentials from configuration
 */
function getLatitudeCredentials(): { apiKey: string; baseUrl: string } {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'getLatitudeCredentials',
	);

	const apiKey = config.get('LATITUDE_API_KEY');
	const baseUrl =
		config.get('LATITUDE_BASE_URL') || LATITUDE_BASE_URL;

	if (!apiKey) {
		methodLogger.error('LATITUDE_API_KEY is not configured');
		throw createAuthInvalidError(
			'LATITUDE_API_KEY is required. Set it in your environment or .env file.',
		);
	}

	methodLogger.debug('Latitude credentials loaded successfully');
	return { apiKey, baseUrl };
}

/**
 * Generic fetch function for Latitude API
 */
async function fetchLatitudeApi<T>(
	endpoint: string,
	options: RequestOptions = {},
): Promise<T> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'fetchLatitudeApi',
	);

	const { apiKey, baseUrl } = getLatitudeCredentials();
	const url = `${baseUrl}/api/${LATITUDE_API_VERSION}${endpoint}`;

	const requestOptions: RequestInit = {
		method: options.method || 'GET',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${apiKey}`,
			...options.headers,
		},
		body: options.body ? JSON.stringify(options.body) : undefined,
	};

	methodLogger.debug(`Executing API call: ${requestOptions.method} ${url}`);
	const startTime = performance.now();

	try {
		const response = await fetch(url, requestOptions);
		const endTime = performance.now();
		const duration = (endTime - startTime).toFixed(2);

		methodLogger.debug(
			`API call completed in ${duration}ms with status: ${response.status}`,
		);

		if (!response.ok) {
			const errorText = await response.text();
			methodLogger.error(`API error response (${response.status}):`, errorText);

			// Try to parse as Latitude error format
			let errorData: LatitudeError | undefined;
			try {
				const parsed = JSON.parse(errorText);
				errorData = LatitudeErrorSchema.parse(parsed);
			} catch {
				// Not a standard Latitude error format
			}

			if (response.status === 401) {
				throw createAuthInvalidError(
					errorData?.message || 'Authentication failed. Check your LATITUDE_API_KEY.',
				);
			} else if (response.status === 403) {
				throw createAuthInvalidError(
					errorData?.message || 'Permission denied for the requested resource.',
				);
			} else if (response.status === 404) {
				throw createApiError(
					errorData?.message || 'Resource not found.',
					response.status,
					errorData || errorText,
				);
			} else if (response.status === 422) {
				throw createApiError(
					errorData?.message || 'Validation error.',
					response.status,
					errorData || errorText,
				);
			} else {
				throw createApiError(
					errorData?.message ||
						`API request failed with status ${response.status}`,
					response.status,
					errorData || errorText,
				);
			}
		}

		// Handle empty responses
		const contentLength = response.headers.get('content-length');
		if (contentLength === '0' || response.status === 204) {
			return {} as T;
		}

		const responseData = await response.json();
		methodLogger.debug('Response body successfully parsed as JSON.');
		return responseData as T;
	} catch (error) {
		if (error instanceof McpError) {
			throw error;
		}

		if (error instanceof TypeError) {
			throw createApiError(
				`Network error during API call: ${error.message}`,
				undefined,
				error,
			);
		}

		throw createUnexpectedError(
			`Unexpected error during API call: ${error instanceof Error ? error.message : String(error)}`,
			error,
		);
	}
}

/**
 * Fetch with streaming support for run/chat endpoints
 */
async function fetchLatitudeStream(
	endpoint: string,
	body: unknown,
): Promise<AsyncGenerator<string, void, unknown>> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'fetchLatitudeStream',
	);

	const { apiKey, baseUrl } = getLatitudeCredentials();
	const url = `${baseUrl}/api/${LATITUDE_API_VERSION}${endpoint}`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'text/event-stream',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw createApiError(
			`Stream request failed: ${response.status}`,
			response.status,
			errorText,
		);
	}

	if (!response.body) {
		throw createApiError('No response body for stream', 500, null);
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();

	async function* streamGenerator(): AsyncGenerator<string, void, unknown> {
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const chunk = decoder.decode(value, { stream: true });
				yield chunk;
			}
		} finally {
			reader.releaseLock();
		}
	}

	methodLogger.debug('Stream initiated successfully');
	return streamGenerator();
}

// ============================================================================
// Projects API
// ============================================================================

async function listProjects(): Promise<Project[]> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'listProjects',
	);
	methodLogger.debug('Listing all projects');

	const data = await fetchLatitudeApi<unknown>('/projects');
	return ProjectListSchema.parse(data);
}

async function createProject(name: string): Promise<Project> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'createProject',
	);
	methodLogger.debug(`Creating project: ${name}`);

	const data = await fetchLatitudeApi<unknown>('/projects', {
		method: 'POST',
		body: { name },
	});
	return data as Project;
}

// ============================================================================
// Versions API
// ============================================================================

async function listVersions(projectId: string): Promise<Version[]> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'listVersions',
	);
	methodLogger.debug(`Listing versions for project: ${projectId}`);

	const data = await fetchLatitudeApi<unknown>(
		`/projects/${projectId}/versions`,
	);
	return VersionListSchema.parse(data);
}

async function getVersion(
	projectId: string,
	versionUuid: string,
): Promise<Version> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'getVersion',
	);
	methodLogger.debug(`Getting version: ${versionUuid} for project: ${projectId}`);

	const data = await fetchLatitudeApi<unknown>(
		`/projects/${projectId}/versions/${versionUuid}`,
	);
	return VersionSchema.parse(data);
}

async function createVersion(
	projectId: string,
	name: string,
): Promise<Version> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'createVersion',
	);
	methodLogger.debug(`Creating version: ${name} for project: ${projectId}`);

	const data = await fetchLatitudeApi<unknown>(
		`/projects/${projectId}/versions`,
		{
			method: 'POST',
			body: { name },
		},
	);
	return VersionSchema.parse(data);
}

async function publishVersion(
	projectId: string,
	versionUuid: string,
	options?: { title?: string; description?: string },
): Promise<Version> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'publishVersion',
	);
	methodLogger.debug(`Publishing version: ${versionUuid}`);

	const data = await fetchLatitudeApi<unknown>(
		`/projects/${projectId}/versions/${versionUuid}/publish`,
		{
			method: 'POST',
			body: options || {},
		},
	);
	return VersionSchema.parse(data);
}

async function pushChanges(
	projectId: string,
	versionUuid: string,
	changes: PushChanges,
): Promise<unknown> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'pushChanges',
	);
	methodLogger.debug(`Pushing ${changes.changes.length} changes to version: ${versionUuid}`);

	return fetchLatitudeApi<unknown>(
		`/projects/${projectId}/versions/${versionUuid}/push`,
		{
			method: 'POST',
			body: changes,
		},
	);
}

// ============================================================================
// Documents/Prompts API
// ============================================================================

async function listDocuments(
	projectId: string,
	versionUuid: string,
): Promise<Document[]> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'listDocuments',
	);
	methodLogger.debug(`Listing documents for project: ${projectId}, version: ${versionUuid}`);

	const data = await fetchLatitudeApi<unknown>(
		`/projects/${projectId}/versions/${versionUuid}/documents`,
	);
	return DocumentListSchema.parse(data);
}

async function getDocument(
	projectId: string,
	versionUuid: string,
	path: string,
): Promise<Document> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'getDocument',
	);
	// Ensure path doesn't start with / for URL construction
	const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
	methodLogger.debug(`Getting document: ${normalizedPath}`);

	const data = await fetchLatitudeApi<unknown>(
		`/projects/${projectId}/versions/${versionUuid}/documents/${normalizedPath}`,
	);
	return DocumentSchema.parse(data);
}

async function createOrUpdateDocument(
	projectId: string,
	versionUuid: string,
	path: string,
	prompt: string,
	force = false,
): Promise<Document> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'createOrUpdateDocument',
	);
	methodLogger.debug(`Creating/updating document: ${path}`);

	const data = await fetchLatitudeApi<unknown>(
		`/projects/${projectId}/versions/${versionUuid}/documents/create-or-update`,
		{
			method: 'POST',
			body: { path, prompt, force },
		},
	);
	return DocumentSchema.parse(data);
}

async function runDocument(
	projectId: string,
	versionUuid: string,
	options: {
		path: string;
		parameters?: Record<string, unknown>;
		stream?: boolean;
		tools?: string[];
		userMessage?: string;
	},
): Promise<unknown> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'runDocument',
	);
	methodLogger.debug(`Running document: ${options.path}`);

	if (options.stream) {
		return fetchLatitudeStream(
			`/projects/${projectId}/versions/${versionUuid}/documents/run`,
			options,
		);
	}

	return fetchLatitudeApi<unknown>(
		`/projects/${projectId}/versions/${versionUuid}/documents/run`,
		{
			method: 'POST',
			body: options,
		},
	);
}

async function createDocumentLog(
	projectId: string,
	versionUuid: string,
	path: string,
	messages: Array<{ role: string; content: string }>,
): Promise<unknown> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'createDocumentLog',
	);
	methodLogger.debug(`Creating log for document: ${path}`);

	return fetchLatitudeApi<unknown>(
		`/projects/${projectId}/versions/${versionUuid}/documents/logs`,
		{
			method: 'POST',
			body: { path, messages },
		},
	);
}

// ============================================================================
// Conversations API
// ============================================================================

async function getConversation(conversationUuid: string): Promise<Conversation> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'getConversation',
	);
	methodLogger.debug(`Getting conversation: ${conversationUuid}`);

	const data = await fetchLatitudeApi<unknown>(
		`/conversations/${conversationUuid}`,
	);
	return data as Conversation;
}

async function chatConversation(
	conversationUuid: string,
	messages: Array<{ role: string; content: string }>,
	stream = false,
): Promise<unknown> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'chatConversation',
	);
	methodLogger.debug(`Chatting in conversation: ${conversationUuid}`);

	if (stream) {
		return fetchLatitudeStream(
			`/conversations/${conversationUuid}/chat`,
			{ messages, stream: true },
		);
	}

	return fetchLatitudeApi<unknown>(`/conversations/${conversationUuid}/chat`, {
		method: 'POST',
		body: { messages, stream: false },
	});
}

async function stopConversation(conversationUuid: string): Promise<unknown> {
	const methodLogger = Logger.forContext(
		'services/vendor.latitude.service.ts',
		'stopConversation',
	);
	methodLogger.debug(`Stopping conversation: ${conversationUuid}`);

	return fetchLatitudeApi<unknown>(`/conversations/${conversationUuid}/stop`, {
		method: 'POST',
	});
}

// ============================================================================
// Export Service
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
	listDocuments,
	getDocument,
	createOrUpdateDocument,
	runDocument,
	createDocumentLog,

	// Conversations
	getConversation,
	chatConversation,
	stopConversation,
};
