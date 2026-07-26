import { getCategoryText } from './Hymn';

export interface SchedulePlanItem {
  id: string;
  bookId: number;
  number: number;
  title: string;
}

export interface SchedulePlan {
  id: string;
  uuid: string;
  name: string;
  displayName?: string;
  scheduledAt: string;
  items: SchedulePlanItem[];
  createdAt: string;
  // optional category label (e.g., 主日聚會, 活力排)
  category?: string;
  isPrimary?: boolean;
}

export interface SharedSchedulePlanPayload {
  uuid: string;
  name: string;
  displayName?: string;
  scheduledAt: string;
  items: Array<{
    bookId: number;
    number: number;
    title: string;
  }>;
}

export function isPlanExpired(plan: SchedulePlan, now: Date = new Date()): boolean {
  return new Date(plan.scheduledAt).getTime() < now.getTime();
}

export function isSameDate(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear()
    && dateA.getMonth() === dateB.getMonth()
    && dateA.getDate() === dateB.getDate()
  );
}

export function isPlanToday(plan: SchedulePlan, now: Date = new Date()): boolean {
  return isSameDate(new Date(plan.scheduledAt), now);
}

export function formatSchedulePlanDateTime(value: string): string {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

export function formatSchedulePlanForShare(plan: SchedulePlan): string {
  const lines = [
    `行程：${plan.name}`,
    ...(plan.displayName ? [`行程名稱：${plan.displayName}`] : []),
    `時間：${formatSchedulePlanDateTime(plan.scheduledAt)}`,
    '',
    '詩歌清單：',
  ];

  if (plan.items.length === 0) {
    lines.push('尚未加入詩歌');
  } else {
    lines.push(...plan.items.map((item, index) => `${index + 1}. (${getCategoryText(item.bookId)})${item.number} - ${item.title}`));
  }

  return lines.join('\n');
}
