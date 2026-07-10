# Public events and slots

## Events

| Event | Component | Trigger | Payload | Cancellation |
| --- | --- | --- | --- | --- |
| `eventClick` | calendar/views/app | Event button activation | `CalendarOccurrence` | Not cancellable |
| `eventCreateRequest` | calendar/views | Day double activation or Shift+Enter/Shift+Space on a date control | `CalendarDay` | Host chooses whether to open an editor |
| `eventCreate` | dialog/app | Valid new draft saved | `CalendarEvent` | Validate or ignore in host |
| `eventUpdate` | dialog/app | Valid edited draft saved | `CalendarEvent` | Validate or ignore in host |
| `eventRemove` | dialog/app | Delete action | `CalendarEvent` | Confirm before passing data if required |
| `dayClick` | calendar/views | Date button activation | `CalendarDay` | Not cancellable |
| `viewChange` | calendar | View control activation | `CalendarView` | Controlled through `view` |
| `rangeChange` | calendar | Navigation or view change | `CalendarRange` | Not cancellable |
| `change` | schedule editor | Recurrence update | `EventSchedule` | Controlled through `modelValue` |

`EventMovePayload` is exported for the drag/move API planned before 1.0. Occurrence movement is
already available through the core `moveOccurrence` function.

## Slots

| Slot | Component | Scope | Purpose |
| --- | --- | --- | --- |
| `toolbar` | `DsCalendar` | date, view, navigate, setView | Replace the calendar toolbar |
| `event` | calendar views | event, day | Safe rich event rendering |
| `date-title` | `DsWeeksView` | day | Customize a date label |
| `empty` | calendar/agenda | day where applicable | Empty state |
| `agenda-event` | `DsAgenda`, calendar | event | Agenda row rendering |
| `actions` | `DsEventDialog` | save, close, remove, valid | Dialog actions |
| `before`, `after` | `DsSchedule` | schedule | Extend recurrence fields |

Slots are trusted application templates. Event title, description, and location are otherwise always
rendered as plain text.

## Weekly recurrence alignment

`RecurrenceRule.weekStart` explicitly controls the first day used to align weekly `interval`
buckets. It accepts JavaScript weekday values from `0` (Sunday) through `6` (Saturday) and defaults
to Monday (`1`). Recurrence alignment does not change when the display locale changes.
