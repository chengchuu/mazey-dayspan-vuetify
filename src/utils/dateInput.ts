export function toLocalInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function fromLocalInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return new Date(Number.NaN)

  const [, yearInput, monthInput, dayInput, hourInput, minuteInput] = match
  const year = Number(yearInput)
  const month = Number(monthInput) - 1
  const day = Number(dayInput)
  const hour = Number(hourInput)
  const minute = Number(minuteInput)

  const date = new Date(0)
  date.setFullYear(year, month, day)
  date.setHours(hour, minute, 0, 0)

  const valid = date.getFullYear() === year
    && date.getMonth() === month
    && date.getDate() === day
    && date.getHours() === hour
    && date.getMinutes() === minute

  return valid ? date : new Date(Number.NaN)
}
