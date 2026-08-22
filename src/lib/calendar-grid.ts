export type CalendarCell = { date: string; day: number; inMonth: boolean };

// Always a whole number of weeks (Sun-start), including the leading/trailing
// days from adjacent months needed to fill the first and last rows.
export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const startWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, i) => {
    const cellDate = new Date(year, month - 1, i - startWeekday + 1);
    return {
      date: `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`,
      day: cellDate.getDate(),
      inMonth: cellDate.getMonth() === month - 1,
    };
  });
}
