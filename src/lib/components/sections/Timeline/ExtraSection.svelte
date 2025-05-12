<script lang="ts">
  export let sectionId: string;
  export let sectionTitle: string;
  export let items: any[];
  
  import { marked } from 'marked';
  import { fadeIn } from '$lib/utils/fadeIn'
</script>

<section id={sectionId} class="section" use:fadeIn>
    <h2>{sectionTitle}</h2>
    {#each items as item, index (item.title || index)}
      <div class="timeline-content">
        <div class="details">
          <span class="date">{item.date}</span>
          {#if item?.icon}
            <div class="timeline-header">
              <div class="timeline-icon">
                <img src={item.icon} alt="">
              </div>
              <div class="timeline-title">
                <a href={item.link} target="_blank" rel="noopener noreferrer" class="hover-link">
                    {#if item.school}
                        <h3 class="entity">{item.school}</h3>
                    {:else if item.company}
                        <h3 class="entity">{item.company}</h3>
                    {/if}
                </a>
                <h3>
                    {item.title}
                </h3>
              </div>
            </div>
          {:else}
            <div class="timeline-title">
                <a href={item.link} target="_blank" rel="noopener noreferrer" class="hover-link">
                    {#if item.school}
                        <h3 class="entity">{item.school}</h3>
                    {:else if item.company}
                        <h3 class="entity">{item.company}</h3>
                    {/if}
                </a>
                <h3>
                    {item.title}
                </h3>
            </div>
          {/if}
            {#if item.description}
              <div class="markdown-content">
                {@html marked.parse(item.description)}
              </div>
            {/if}
        </div>
      </div>
    {/each}
</section>


<style>
  @import '/src/styles/extra-section.css';
</style>