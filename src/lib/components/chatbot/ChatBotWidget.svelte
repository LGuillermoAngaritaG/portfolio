<script lang="ts">
    import { onMount } from 'svelte';
    import { base } from '$app/paths';

    // State for controlling the iframe visibility
    let showChatbotWidget = false;
    const chatbotSrc = `${base}/chatbot`; // add .html for production
    let chatbotIframeElement: HTMLIFrameElement;

    function toggleChatbotWidget() {
        showChatbotWidget = !showChatbotWidget;
    }

    onMount(() => {
        const handleMessage = (event: MessageEvent) => {
            // IMPORTANT: Always check the origin for security.
            // The iframe src is `${base}/chatbot`, so it's same-origin.
            if (event.origin !== window.location.origin) {
                console.warn('Message from untrusted origin:', event.origin, 'Expected:', window.location.origin);
                return;
            }

            if (event.data && event.data.type === 'CHAT_IFRAME_REQUEST_CLOSE') {
                showChatbotWidget = false;
            }
            // Handle other messages from the iframe if necessary
            // e.g., if (event.data.type === 'NEW_MESSAGE_NOTIFICATION') { ... }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    });
</script>

<!-- Chatbot Launcher Button -->
<button class="chatbot-launcher" on:click={toggleChatbotWidget} aria-label={showChatbotWidget ? 'Close chat widget' : 'Open chat widget'}>
    {#if showChatbotWidget}
        <!-- X icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    {:else}
        <!-- Chat icon -->
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    {/if}
</button>

<!-- Iframe Container for the Chatbot Widget -->
{#if showChatbotWidget}
    <div class="chatbot-widget-container">
        <iframe
            bind:this={chatbotIframeElement}
            src={chatbotSrc}
            title="Chatbot Assistant"
            class="chatbot-iframe"
            allow="clipboard-write"
        ></iframe>
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
        width: 380px;  /* Adjust as needed */
        height: 600px; /* Adjust as needed */
        background-color: #ffffff; /* Fallback background */
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        overflow: hidden; /* Crucial for iframe border-radius and clipping */
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

    .chatbot-iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
</style>