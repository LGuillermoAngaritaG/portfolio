<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { PortfolioData } from '$lib/types/types.js';

  	export let portfolioData: PortfolioData;

	interface Message {
		id: string;
		role: 'user' | 'assistant';
		content: string;
	}
	console.log("HOLA")

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
						'Accept': 'text/plain'
					},
					body: JSON.stringify({
						messages: apiHistory.map(msg => ({ // This inner map is redundant if apiHistory is already correct
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
		// Explicitly remove from localStorage on reset
		if (typeof window !== 'undefined') {
			localStorage.removeItem(LOCAL_STORAGE_KEY);
		}
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
						console.warn("Stored chat history is not an array, clearing invalid data.");
						localStorage.removeItem(LOCAL_STORAGE_KEY);
					}
				} catch (e) {
					console.error('Error parsing chat history from localStorage, clearing corrupted data:', e);
					localStorage.removeItem(LOCAL_STORAGE_KEY);
				}
			}
		}
		scrollToBottom();
	});

	// Reactive statement: Save to localStorage whenever messageHistory changes
	$: {
		if (typeof window !== 'undefined' && messageHistory && messageHistory.length > 0) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messageHistory));
		}
	}
</script>

<div class="chat-container">
	<h1>{portfolioData.name}'s Agent</h1>
	<div class="messages" bind:this={messagesContainer}>
		{#each messageHistory as message (message.id)}
			<div class="message {message.role}-message">
				{@html message.content.replace(/\n/g, '<br>')}
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
			{#if isLoading}Sending...{:else}Send{/if}
		</button>
		<button class="reset-btn" on:click={resetHistory} disabled={isLoading}>Reset</button>
	</div>
</div>

<style>
	.chat-container {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		box-sizing: border-box;
		font-family: var(--font-primary, var(--font-system, Arial, sans-serif));
		
		display: flex;
		flex-direction: column;
		
		padding: 20px; 
		background-color: var(--card-background);
		color: var(--text-color);
		margin: 0;
        transition: background-color 0.3s ease, color 0.3s ease;
	}

	.chat-container h1 {
		color: var(--primary-color);
		text-align: center;
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.8rem;
        font-family: var(--font-secondary, var(--font-system, Arial, sans-serif));
        transition: color 0.3s ease;
	}

	.messages {
		flex-grow: 1;
		overflow-y: auto;
		margin-bottom: 15px; /* Reduced margin */
		padding: 15px;
		border: var(--card-border);
		border-radius: 8px;
		background-color: var(--chatbot-messages-background, var(--background-color)); /* Use specific var or fallback */
        transition: background-color 0.3s ease, border-color 0.3s ease;
	}

	.message {
		margin-bottom: 12px;
		padding: 10px 15px; /* Adjusted padding */
		border-radius: 18px; /* Rounded bubbles */
		word-wrap: break-word;
        white-space: pre-wrap; /* Respect newlines in messages */
		line-height: 1.5;
		max-width: 80%;
        transition: background-color 0.3s ease, color 0.3s ease;
	}

	.user-message {
		background-color: var(--primary-color);
		color: var(--chatbot-text-on-primary);
		margin-left: auto; 
		text-align: left; 
		border-bottom-right-radius: 5px; /* "Tail" effect */
	}

	.assistant-message {
		background-color: var(--hover-background-subtle);
		color: var(--text-color);
		margin-right: auto;
		text-align: left;
		border-bottom-left-radius: 5px; /* "Tail" effect */
	}

	.input-container {
		display: flex;
		gap: 8px;
		margin-top: auto; 
	}

	input[type='text'] {
		flex: 1;
		padding: 12px 10px;
		border: var(--card-border);
		border-radius: 8px;
		background-color: var(--chatbot-input-background, var(--card-background));
		color: var(--text-color);
		font-size: 1rem;
        font-family: var(--font-primary, var(--font-system, sans-serif));
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
	}

	input[type='text']::placeholder {
		color: var(--text-secondary-color);
		opacity: 0.8;
        transition: color 0.3s ease;
	}

	button {
		padding: 10px 10px;
		background-color: var(--primary-color);
		color: var(--chatbot-text-on-primary);
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease;
		font-weight: 500;
        font-family: var(--font-primary, var(--font-system, sans-serif));
		font-size: 0.95rem;
	}

	button:hover:not(:disabled) {
		background-color: var(--link-hover-color); /* Use theme's link hover color */
	}

	button:disabled {
		background-color: var(--hover-background-color);
		color: var(--text-secondary-color);
		cursor: not-allowed;
		opacity: 0.7;
	}

	.reset-btn {
		background-color: var(--destructive-color);
		color: var(--chatbot-text-on-secondary); /* Assuming light text on destructive buttons */
	}

	.reset-btn:hover:not(:disabled) {
		background-color: var(--destructive-color-hover);
	}

	/* Custom Scrollbar Styling */
	.messages::-webkit-scrollbar {
		width: 8px;
	}
	.messages::-webkit-scrollbar-track {
		background: transparent; /* Make track transparent to show messages background */
		border-radius: 10px;
        margin: 5px 0;
	}
	.messages::-webkit-scrollbar-thumb {
		background-color: var(--text-secondary-color);
		border-radius: 10px;
		border: 2px solid var(--chatbot-messages-background, var(--background-color)); /* Creates padding around thumb */
        transition: background-color 0.3s ease;
	}
	.messages::-webkit-scrollbar-thumb:hover {
		background-color: var(--primary-color);
	}
</style>