import { writable, derived } from 'svelte/store';
import type { CardItem } from '$lib/types/types';


export function createCardsStore(items: CardItem[], itemsPerPage: number = 3) {
    const currentPage = writable(1);
    const selectedTags = writable<string[]>([]);

    // Get all unique keywords/tags from items and sort by frequency
    const keywordFrequency = items.reduce((acc, item) => {
        const tags = (item.keywords || item.metadata?.tags || []) as string[];
        if (tags.length > 0) {
            tags.forEach((tag: string) => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
        }
        return acc;
    }, {} as Record<string, number>);

    const availableTags = derived(
        writable(items),
        ($items) => Object.entries(keywordFrequency)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([keyword]) => keyword)
    );

    // Filter items based on selected tags
    const filteredItems = derived([selectedTags], ([$selectedTags]) => {
        if ($selectedTags.length === 0) return items;
        
        return items.filter((item) => {
            const tags = (item.keywords || item.metadata?.tags || []) as string[];
            return tags.length > 0 && 
                $selectedTags.every((selectedTag) =>
                    tags.map((t: string) => t.toLowerCase()).includes(selectedTag.toLowerCase())
                );
        });
    });

    // Pagination logic
    const totalPages = derived([filteredItems], ([$filteredItems]) => 
        Math.ceil($filteredItems.length / itemsPerPage)
    );

    const paginatedItems = derived(
        [filteredItems, currentPage],
        ([$filteredItems, $currentPage]) => 
            $filteredItems.slice(
                ($currentPage - 1) * itemsPerPage,
                $currentPage * itemsPerPage
            )
    );

    // Reset current page when tags change
    selectedTags.subscribe(() => {
        currentPage.set(1);
    });

    function handlePageChange(newPage: number) {
        totalPages.subscribe($totalPages => {
            if (newPage >= 1 && newPage <= $totalPages) {
                currentPage.set(newPage);
            }
        })();
    }

    function handleTagChange(newTagValues: string[]) {
        selectedTags.set(newTagValues);
    }

    return {
        currentPage,
        selectedTags,
        availableTags,
        filteredItems,
        totalPages,
        paginatedItems,
        handlePageChange,
        handleTagChange
    };
} 