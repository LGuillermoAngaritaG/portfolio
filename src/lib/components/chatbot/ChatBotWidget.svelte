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
			const html = marked.parse(content, { async: false, breaks: true });
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
	<div
		class="chatbot-widget-container"
		role="dialog"
		aria-label="{portfolioData.settings.name}'s Agent"
	>
		<div class="chat-header">
			<h2>{portfolioData.settings.name}'s Agent</h2>
			<button class="reset-btn" on:click={resetHistory} disabled={isLoading}>Reset</button>
		</div>
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
				aria-label="Message"
				on:keypress={handleKeyPress}
				disabled={isLoading}
			/>
			<button class="btn btn-primary" on:click={sendMessage} disabled={isLoading}>
				{#if isLoading}...{:else}Send{/if}
			</button>
		</div>
	</div>
{/if}

<style>
	.chatbot-launcher {
		position: fixed;
		right: 1.25rem;
		bottom: 1.25rem;
		z-index: 1001;
		display: grid;
		place-items: center;
		width: 3.25rem;
		height: 3.25rem;
		border: 0;
		border-radius: 50%;
		background: var(--primary-color);
		color: var(--text-on-primary);
		box-shadow: 0 6px 20px -4px rgba(0, 0, 0, 0.35);
		cursor: pointer;
		transition: transform 0.2s var(--ease-out);
	}

	.chatbot-launcher:hover {
		transform: scale(1.06);
	}

	.chatbot-widget-container {
		position: fixed;
		right: 1.25rem;
		bottom: 5.25rem;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		width: min(23.75rem, 100vw - 2.5rem);
		height: min(37.5rem, 100dvh - 6.5rem);
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		background: var(--card-background);
		box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.35);
		overflow: hidden;
		animation: slideIn 0.3s var(--ease-out);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(0.75rem);
		}
	}

	.chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0.75rem 0.75rem 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	.chat-header h2 {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.reset-btn {
		padding: 0.25rem 0.5rem;
		border: 0;
		border-radius: 0.375rem;
		background: none;
		color: var(--text-secondary-color);
		font: inherit;
		font-size: 0.8125rem;
		cursor: pointer;
	}

	.reset-btn:hover:not(:disabled) {
		background: var(--hover-background-subtle);
		color: var(--text-color);
	}

	.messages {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		overflow-y: auto;
	}

	.message {
		max-width: 85%;
		padding: 0.5rem 0.75rem;
		border-radius: 1rem;
		font-size: 0.9rem;
		line-height: 1.45;
		overflow-wrap: break-word;
	}

	.user-message {
		align-self: flex-end;
		border-bottom-right-radius: 0.25rem;
		background: var(--primary-color);
		color: var(--text-on-primary);
	}

	.assistant-message {
		align-self: flex-start;
		border-bottom-left-radius: 0.25rem;
		background: var(--hover-background-subtle);
	}

	/* Markdown inside a message */
	.message :global(:first-child) {
		margin-top: 0;
	}

	.message :global(:last-child) {
		margin-bottom: 0;
	}

	.message :global(p),
	.message :global(ul),
	.message :global(ol),
	.message :global(pre),
	.message :global(blockquote) {
		margin: 0.5em 0;
	}

	.message :global(h1),
	.message :global(h2),
	.message :global(h3),
	.message :global(h4) {
		margin: 0.6em 0 0.3em;
		font-size: 1em;
		font-weight: 600;
	}

	.message :global(ul),
	.message :global(ol) {
		padding-left: 1.2em;
	}

	.message :global(code) {
		padding: 0.1em 0.3em;
		border-radius: 0.25rem;
		background: var(--hover-background-subtle);
		font-family: var(--font-mono);
		font-size: 0.85em;
	}

	.message :global(pre) {
		padding: 0.75em;
		border-radius: 0.5rem;
		background: var(--hover-background-subtle);
		overflow-x: auto;
	}

	.message :global(pre code) {
		padding: 0;
		background: none;
	}

	.message :global(blockquote) {
		padding-left: 0.75em;
		border-left: 2px solid var(--border-color);
	}

	.message :global(a) {
		color: inherit;
		text-decoration: underline;
	}

	.input-container {
		display: flex;
		gap: 0.5rem;
		padding: 0.75rem;
		border-top: 1px solid var(--border-color);
	}

	input[type='text'] {
		flex: 1;
		min-width: 0;
		height: 2.5rem;
		padding-inline: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 0.625rem;
		background: var(--background-color);
		color: var(--text-color);
		font: inherit;
		font-size: 0.9rem;
	}

	input[type='text']::placeholder {
		color: var(--text-secondary-color);
	}
</style>
