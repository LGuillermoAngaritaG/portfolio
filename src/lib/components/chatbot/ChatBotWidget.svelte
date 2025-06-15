<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import type { PortfolioData } from '$lib/types/types.js';

	export let portfolioData: PortfolioData;

	interface Message {
		id: string;
		role: 'user' | 'assistant';
		content: string;
	}

	// State for controlling the chatbot visibility
	let showChatbotWidget = false;
	let messageHistory: Message[] = [];
	let userInput: string = '';
	let messagesContainer: HTMLDivElement;
	let isLoading: boolean = false;

	const LOCAL_STORAGE_KEY = 'chatHistory';

	const generateId = (): string => '_' + Math.random().toString(36).substring(2, 9);

	async function scrollToBottom(): Promise<void> {
		await tick();
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	function toggleChatbotWidget() {
		showChatbotWidget = !showChatbotWidget;
		if (showChatbotWidget) {
			setTimeout(() => scrollToBottom(), 100);
		}
	}

	function handleKeyPress(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !isLoading) {
			sendMessage();
		}
	}

	async function sendMessage(): Promise<void> {
		const messageText = userInput.trim();

		if (messageText && !isLoading) {
			isLoading = true;
			const userMessage: Message = { id: generateId(), role: 'user', content: messageText };
			messageHistory = [...messageHistory, userMessage];
			userInput = '';
			await scrollToBottom();

			const apiHistory = messageHistory.map(({ role, content }) => ({ role, content }));

			const assistantMessageId = generateId();
			let assistantMessageContent = '';
			messageHistory = [
				...messageHistory,
				{ id: assistantMessageId, role: 'assistant', content: '...' }
			];
			await scrollToBottom();

			try {
				const response = await fetch('https://portfolio-909979642268.us-central1.run.app/ask', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'text/plain'
					},
					body: JSON.stringify({
						messages: apiHistory.map((msg) => ({
							role: msg.role,
							content: msg.content
						}))
					})
				});

				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				if (!response.body) {
					throw new Error('Response body is null');
				}

				const reader = response.body.getReader();
				const decoder = new TextDecoder();

				const updateAssistantMessage = (newContent: string) => {
					messageHistory = messageHistory.map((msg) =>
						msg.id === assistantMessageId ? { ...msg, content: newContent } : msg
					);
				};

				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						const chunk = decoder.decode(value, { stream: true });
						assistantMessageContent += chunk;
						updateAssistantMessage(assistantMessageContent);
						await scrollToBottom();
					}
				} finally {
					reader.releaseLock();
				}
				assistantMessageContent += decoder.decode();
				updateAssistantMessage(assistantMessageContent);
			} catch (error) {
				console.error('Error:', error);
				const errorMessage = error instanceof Error ? error.message : 'Sorry, there was an error.';
				messageHistory = messageHistory.map((msg) =>
					msg.id === assistantMessageId ? { ...msg, content: `Error: ${errorMessage}` } : msg
				);
			} finally {
				isLoading = false;
				await scrollToBottom();
			}
		}
	}

	function resetHistory(): void {
		messageHistory = [];
		userInput = '';
		isLoading = false;
		if (typeof window !== 'undefined') {
			localStorage.removeItem(LOCAL_STORAGE_KEY);
		}

		// Add welcome message after reset
		const welcomeMessage: Message = {
			id: generateId(),
			role: 'assistant',
			content: `Hello! I'm ${portfolioData.settings.name}'s Agent. I can help you learn more about his background, experience, and projects. Feel free to ask me anything!`
		};
		messageHistory = [welcomeMessage];
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (storedHistory) {
				try {
					const parsedHistory: Message[] = JSON.parse(storedHistory);
					if (Array.isArray(parsedHistory)) {
						messageHistory = parsedHistory;
					} else {
						console.warn('Stored chat history is not an array, clearing invalid data.');
						localStorage.removeItem(LOCAL_STORAGE_KEY);
					}
				} catch (e) {
					console.error(
						'Error parsing chat history from localStorage, clearing corrupted data:',
						e
					);
					localStorage.removeItem(LOCAL_STORAGE_KEY);
				}
			}

			// Add welcome message if no history exists
			if (messageHistory.length === 0) {
				const welcomeMessage: Message = {
					id: generateId(),
					role: 'assistant',
					content: `Hello! I'm ${portfolioData.settings.name}'s Agent. I can help you learn more about his background, experience, and projects. Feel free to ask me anything!`
				};
				messageHistory = [welcomeMessage];
			}
		}
	});

	// Reactive statement: Save to localStorage whenever messageHistory changes
	$: {
		if (typeof window !== 'undefined' && messageHistory && messageHistory.length > 0) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messageHistory));
		}
	}

	/**
	 * Renders markdown content to sanitized HTML
	 * @param content - The markdown content to render
	 * @returns Sanitized HTML string
	 */
	function renderMarkdown(content: string): string {
		try {
			const html = marked(content);
			return DOMPurify.sanitize(html);
		} catch (error) {
			console.error('Error rendering markdown:', error);
			// Fallback to simple line break replacement
			return content.replace(/\n/g, '<br>');
		}
	}
</script>

<!-- Chatbot Launcher Button -->
<button
	class="chatbot-launcher"
	on:click={toggleChatbotWidget}
	aria-label={showChatbotWidget ? 'Close chat widget' : 'Open chat widget'}
>
	{#if showChatbotWidget}
		<!-- X icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg
		>
	{:else}
		<!-- Chat icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg
		>
	{/if}
</button>

<!-- Chatbot Widget Container -->
{#if showChatbotWidget}
	<div class="chatbot-widget-container">
		<div class="chat-container">
			<h1>{portfolioData.settings.name}'s Agent</h1>
			<div class="messages" bind:this={messagesContainer}>
				{#each messageHistory as message (message.id)}
					<div class="message {message.role}-message">
						{@html renderMarkdown(message.content)}
					</div>
				{/each}
			</div>
			<div class="input-container">
				<input
					type="text"
					bind:value={userInput}
					placeholder="Type your message..."
					on:keypress={handleKeyPress}
					disabled={isLoading}
				/>
				<button on:click={sendMessage} disabled={isLoading}>
					{#if isLoading}...{:else}Send{/if}
				</button>
				<button class="reset-btn" on:click={resetHistory} disabled={isLoading}>Reset</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.chatbot-launcher {
		position: fixed;
		bottom: 20px;
		right: 20px;
		background-color: var(--primary-color);
		color: white;
		border: none;
		border-radius: 50%;
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		z-index: 1001; /* Higher than widget container when widget is closed */
		transition: transform 0.2s ease-in-out;
	}
	.chatbot-launcher:hover {
		transform: scale(1.1);
	}
	.chatbot-launcher svg {
		pointer-events: none; /* So clicks go to the button */
	}

	.chatbot-widget-container {
		position: fixed;
		bottom: 90px; /* Position above the launcher */
		right: 20px;
		width: 380px; /* Adjust as needed */
		height: 600px; /* Adjust as needed */
		background-color: var(--card-background);
		border-radius: 12px;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
		overflow: hidden; /* Crucial for border-radius and clipping */
		z-index: 1000;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.chat-container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 16px;
		background-color: var(--card-background);
		color: var(--text-color);
		font-family: var(--font-primary, var(--font-system, Arial, sans-serif));
		box-sizing: border-box;
	}

	.chat-container h1 {
		color: var(--primary-color);
		text-align: center;
		margin: 0 0 16px 0;
		font-size: 1.4rem;
		font-family: var(--font-secondary, var(--font-system, Arial, sans-serif));
	}

	.messages {
		flex-grow: 1;
		overflow-y: auto;
		margin-bottom: 12px;
		padding: 12px;
		border: var(--card-border);
		border-radius: 8px;
		background-color: var(--background-color);
	}

	.message {
		margin-bottom: 10px;
		padding: 8px 12px;
		border-radius: 16px;
		word-wrap: break-word;
		white-space: pre-wrap;
		line-height: 1.4;
		max-width: 85%;
		font-size: 0.9rem;
	}

	/* Add markdown-specific styles */
	.message :global(h1),
	.message :global(h2),
	.message :global(h3),
	.message :global(h4),
	.message :global(h5),
	.message :global(h6) {
		margin: 0.5em 0 0.3em 0;
		font-weight: 600;
	}

	.message :global(p) {
		margin: 0.5em 0;
	}

	.message :global(ul),
	.message :global(ol) {
		margin: 0.5em 0;
		padding-left: 1.2em;
	}

	.message :global(li) {
		margin: 0.2em 0;
	}

	.message :global(code) {
		background-color: rgba(0, 0, 0, 0.1);
		padding: 0.1em 0.3em;
		border-radius: 3px;
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.85em;
	}

	.message :global(pre) {
		background-color: rgba(0, 0, 0, 0.1);
		padding: 0.8em;
		border-radius: 6px;
		overflow-x: auto;
		margin: 0.5em 0;
	}

	.message :global(pre code) {
		background-color: transparent;
		padding: 0;
	}

	.message :global(blockquote) {
		border-left: 3px solid var(--primary-color);
		padding-left: 1em;
		margin: 0.5em 0;
		font-style: italic;
		opacity: 0.9;
	}

	.message :global(a) {
		color: var(--primary-color);
		text-decoration: underline;
	}

	.message :global(a:hover) {
		color: var(--link-hover-color);
	}

	.message :global(strong) {
		font-weight: 600;
	}

	.message :global(em) {
		font-style: italic;
	}

	.user-message {
		background-color: var(--primary-color);
		color: white;
		margin-left: auto;
		text-align: left;
		border-bottom-right-radius: 4px;
	}

	.assistant-message {
		background-color: var(--hover-background-subtle);
		color: var(--text-color);
		margin-right: auto;
		text-align: left;
		border-bottom-left-radius: 4px;
	}

	.input-container {
		display: flex;
		gap: 6px;
	}

	input[type='text'] {
		flex: 1;
		padding: 10px 8px;
		border: var(--card-border);
		border-radius: 6px;
		background-color: var(--card-background);
		color: var(--text-color);
		font-size: 0.9rem;
		font-family: var(--font-primary, var(--font-system, sans-serif));
	}

	input[type='text']::placeholder {
		color: var(--text-secondary-color);
		opacity: 0.8;
	}

	button {
		padding: 8px 12px;
		background-color: var(--primary-color);
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 0.2s ease;
		font-weight: 500;
		font-family: var(--font-primary, var(--font-system, sans-serif));
		font-size: 0.85rem;
	}

	button:hover:not(:disabled) {
		background-color: var(--link-hover-color);
	}

	button:disabled {
		background-color: var(--hover-background-color);
		color: var(--text-secondary-color);
		cursor: not-allowed;
		opacity: 0.7;
	}

	.reset-btn {
		background-color: var(--destructive-color);
	}

	.reset-btn:hover:not(:disabled) {
		background-color: var(--destructive-color-hover);
	}

	/* Custom Scrollbar */
	.messages::-webkit-scrollbar {
		width: 6px;
	}
	.messages::-webkit-scrollbar-track {
		background: transparent;
		border-radius: 6px;
	}
	.messages::-webkit-scrollbar-thumb {
		background-color: var(--text-secondary-color);
		border-radius: 6px;
		opacity: 0.5;
	}
	.messages::-webkit-scrollbar-thumb:hover {
		background-color: var(--primary-color);
		opacity: 0.8;
	}
</style>
