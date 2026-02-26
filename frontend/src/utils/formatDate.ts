export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const dd = date.getDate().toString().padStart(2, '0');
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function toAPIDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function todayAPI(): string {
  return toAPIDate(new Date());
}

export function getFirstDayOfMonth(): string {
  const d = new Date();
  return toAPIDate(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function getFinancialYearDates(): { from: string; to: string } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  let fyStart: Date;
  let fyEnd: Date;
  if (month >= 4) {
    fyStart = new Date(year, 3, 1);
    fyEnd = new Date(year + 1, 2, 31);
  } else {
    fyStart = new Date(year - 1, 3, 1);
    fyEnd = new Date(year, 2, 31);
  }
  return { from: toAPIDate(fyStart), to: toAPIDate(fyEnd) };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
