export function toLocalInput(date: Date) { const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return local.toISOString().slice(0, 16) }
export function fromLocalInput(value: string) { return new Date(value) }
