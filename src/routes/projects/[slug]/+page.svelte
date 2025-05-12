<script lang="ts">
    import type { PortfolioData, Project } from '$lib/types/types.ts';
    import Navbar from '$lib/components/NavBar.svelte';
    import portfolioData from '../../../content/data/portfolio-data.json';
    import ChatBotWidget from '$lib/components/chatbot/ChatBotWidget.svelte';
    import { base } from '$app/paths';
    import 'highlight.js/styles/atom-one-dark.css';

    export let data: Project;
    const typedPortfolioData = portfolioData as PortfolioData;
</script>

<div class="slug-page-container">
    <Navbar portfolioData={typedPortfolioData} />
    <article class="slug-article">
        <header>
            <h1>{data.metadata.title}</h1>
            <div class="metadata">
                <time datetime={data.metadata.date}>{data.metadata.date}</time>
                <div class="tags">
                    {#each Array.isArray(data.metadata.tags)
                        ? data.metadata.tags
                        : data.metadata.tags.split(',').map(tag => tag.trim())
                    as tag}
                        <span class="tag">{tag}</span>
                    {/each}
                </div>
            </div>
        </header>
        <div class="content">
            {@html data.html}
        </div>
        {#if data.nextProject}
            <div class="next-navigation">
                <a href="{base}/projects/{data.nextProject.slug}" class="next-button">
                    Next Project: {data.nextProject.title}
                    <span class="arrow">→</span>
                </a>
            </div>
        {/if}
    </article>
</div>

<ChatBotWidget />

<style>
    @import '/src/styles/slug-styles.css';

    .content {
        max-width: 100%;
        overflow-x: hidden;
    }

    .content :global(pre) {
        max-width: 100%;
        overflow-x: auto;
        padding: 1rem;
        border-radius: 4px;
        background-color: #282c34;
        margin: 1rem 0;
    }

    .content :global(code) {
        font-family: 'Consolas', 'Monaco', 'Andale Mono', monospace;
        font-size: 0.9em;
    }

    .content :global(p), .content :global(li) {
        line-height: 1.6;
    }

    .content :global(img) {
        max-width: 100%;
        height: auto;
    }

    .content :global(h1), .content :global(h2), .content :global(h3) {
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
</style>