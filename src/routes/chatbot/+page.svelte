<script lang="ts">
    import Chatbot from '$lib/components/chatbot/ChatBot.svelte';
    import type { PortfolioData } from '$lib/types/types.js';

    export let data: { portfolioData: PortfolioData };
    const { portfolioData } = data;

    import { onMount } from 'svelte';

    onMount(() => {
        window.addEventListener('message', (event) => {
            console.log('Message received in iframe:', event.data);
            if (event.data && event.data.type === 'INIT_CHAT') {
            }
        });

        window.parent.postMessage({ type: 'CHAT_IFRAME_READY', height: document.body.scrollHeight }, 'https://lguillermoa.github.io');
    });
</script>

<Chatbot {portfolioData} />
