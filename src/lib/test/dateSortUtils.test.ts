import { sortItemsByDate, shouldSortSectionByDate, sortByOrderAndDate } from '../utils/dateSortUtils';
import { describe, it, expect } from 'vitest';

describe('dateSortUtils', () => {
  it('sortItemsByDate sorts items by date newest first', () => {
    const items = [
      { date: '2020-01-01', title: 'Old' },
      { date: '2023-01-01', title: 'New' }
    ];

    const result = sortItemsByDate(items);

    expect(result[0].title).toBe('New');
    expect(result[1].title).toBe('Old');
  });

  it('shouldSortSectionByDate returns true when content has dates', () => {
    const section = {
      content: [{ date: '2023-01-01', title: 'Item' }]
    };

    expect(shouldSortSectionByDate(section)).toBe(true);
  });

  it('sortByOrderAndDate sorts by order first, then date', () => {
    const itemA = { metadata: { display_order: 2 } };
    const itemB = { metadata: { display_order: 1 } };

    expect(sortByOrderAndDate(itemA, itemB)).toBeGreaterThan(0);
  });
});
