// Geometry for the tree: slots are arranged in a triangle (row k holds k + 1 slots).
// All positions are percentages of the tree box, so the layout scales without measuring the DOM.

export const MIN_ROWS = 7;
const SPARE_LIGHTS = 3; // always leave a few unlit spots inviting the next person

export type Slot = { row: number; col: number; x: number; y: number };

export function rowsFor(count: number): number {
  const needed = count + SPARE_LIGHTS;
  let rows = MIN_ROWS;
  while ((rows * (rows + 1)) / 2 < needed) rows++;
  return rows;
}

export function buildSlots(rows: number): Slot[] {
  const cell = 100 / rows;
  const slots: Slot[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= row; col++) {
      slots.push({
        row,
        col,
        x: 50 + (col - row / 2) * cell,
        y: (row + 0.5) * cell,
      });
    }
  }
  return slots;
}
