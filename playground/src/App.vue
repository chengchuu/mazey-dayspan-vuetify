<script setup lang="ts">
import { ref } from 'vue'
import {
  DsCalendarApp,
  DsSchedule,
  useMazeyDaySpan,
  type CalendarEvent,
  type CalendarView,
  type EventSchedule,
} from 'mazey-dayspan-vuetify'

const dayspan = useMazeyDaySpan()
const view = ref<CalendarView>('month')
const dark = ref(false)
const events = ref<CalendarEvent[]>([
  {
    id: 'welcome',
    title: 'Project planning',
    start: new Date(2026, 6, 10, 9),
    end: new Date(2026, 6, 10, 10, 30),
    color: '#1565c0',
    description: 'A safe plain-text event.',
  },
  {
    id: 'weekly',
    title: 'Weekly review',
    start: new Date(2026, 6, 6, 14),
    end: new Date(2026, 6, 6, 15),
    color: '#7b1fa2',
    schedule: { recurrence: { frequency: 'weekly', byWeekday: [1], count: 12 } },
  },
])
const schedule = ref<EventSchedule>({
  recurrence: { frequency: 'weekly', interval: 1, byWeekday: [1], weekStart: 1 },
})

function upsert(event: CalendarEvent) {
  const index = events.value.findIndex((item) => item.id === event.id)
  if (index < 0) events.value.push(event)
  else events.value.splice(index, 1, event)
}
function remove(event: CalendarEvent) {
  events.value = events.value.filter((item) => item.id !== event.id)
}
</script>

<template>
  <VApp :theme="dark ? 'dark' : 'light'">
    <VMain>
      <main>
        <header class="hero">
          <nav class="site-nav" aria-label="Primary navigation">
            <a class="brand" href="#top" aria-label="mazey-dayspan-vuetify home">mazey-dayspan-vuetify</a>
            <div class="site-nav__links">
              <a href="#features">Features</a>
              <a href="#demo">Demo</a>
              <a href="#install">Install</a>
            </div>
          </nav>

          <div id="top" class="hero__content">
            <p class="eyebrow">
              Vue 3 · TypeScript · Vuetify 3
            </p>
            <h1>Modern calendar and scheduling components for Vue 3</h1>
            <p class="hero__summary">
              Build accessible month, week, day, and agenda experiences with typed events,
              recurring schedules, localization, and safe custom rendering.
            </p>
            <div class="hero__actions">
              <a class="button button--primary" href="#demo">Explore the live demo</a>
              <a class="button" href="#install">View installation</a>
            </div>
          </div>
        </header>

        <section id="features" class="section section--narrow" aria-labelledby="features-title">
          <p class="eyebrow">
            Built for application teams
          </p>
          <h2 id="features-title">
            Calendar features without legacy Vue 2 internals
          </h2>
          <div class="feature-grid">
            <article>
              <h3>Complete calendar views</h3>
              <p>Compose responsive month, week, day, and agenda views with overlapping timed-event layout.</p>
            </article>
            <article>
              <h3>Typed scheduling</h3>
              <p>Model daily, weekly, monthly, and yearly recurrence with inclusions, exclusions, cancellations, and moved occurrences.</p>
            </article>
            <article>
              <h3>Safe customization</h3>
              <p>Use typed slots and emitted events while titles and descriptions remain plain text by default.</p>
            </article>
            <article>
              <h3>Accessible and localized</h3>
              <p>Offer keyboard-operable date controls, visible focus, runtime locale switching, and configurable first-day-of-week behavior.</p>
            </article>
          </div>
        </section>

        <section id="demo" class="section" aria-labelledby="demo-title">
          <div class="section-heading">
            <div>
              <p class="eyebrow">
                Interactive playground
              </p>
              <h2 id="demo-title">
                Try the Vue 3 calendar
              </h2>
              <p>Create, edit, remove, and inspect recurring events across each calendar view.</p>
            </div>
            <div class="demo-controls" aria-label="Playground display settings">
              <VSelect
                label="Locale"
                :items="['en', 'zh-CN']"
                :model-value="dayspan.locale.value"
                @update:model-value="dayspan.setLocale($event)"
              />
              <VSwitch v-model="dark" label="Dark mode" />
            </div>
          </div>

          <div class="demo-frame">
            <DsCalendarApp
              v-model:view="view"
              :date="new Date(2026, 6, 10)"
              :events="events"
              @event-create="upsert"
              @event-update="upsert"
              @event-remove="remove"
            >
              <template #event="{ event }">
                <strong>● {{ event.title }}</strong>
              </template>
            </DsCalendarApp>
          </div>
        </section>

        <section class="section section--split" aria-labelledby="recurrence-title">
          <div>
            <p class="eyebrow">
              Recurring schedules
            </p>
            <h2 id="recurrence-title">
              Configure recurrence with a typed model
            </h2>
            <p>
              Weekly interval alignment is explicit, locale-independent, and extensible through
              the same event schedule used by calendar views.
            </p>
          </div>
          <div class="recurrence-demo">
            <DsSchedule v-model="schedule" />
            <pre aria-label="Current recurrence data"><code>{{ schedule }}</code></pre>
          </div>
        </section>

        <section id="install" class="section section--narrow install" aria-labelledby="install-title">
          <p class="eyebrow">
            Get started
          </p>
          <h2 id="install-title">
            Install mazey-dayspan-vuetify
          </h2>
          <p>Use npm to add the library alongside its Vue and Vuetify peer dependencies.</p>
          <pre><code>npm install mazey-dayspan-vuetify vue vuetify</code></pre>
          <p>
            Migrating from the original library? Familiar high-level names such as
            <code>DsCalendar</code>, <code>DsCalendarApp</code>, and <code>DsSchedule</code> are retained.
          </p>
        </section>

        <footer>
          <p><strong>mazey-dayspan-vuetify</strong> is an independent MIT-licensed Vue 3 successor inspired by DaySpan Vuetify.</p>
        </footer>
      </main>
    </VMain>
  </VApp>
</template>

<style>
:root {
  scroll-behavior: smooth;
}

body {
  margin: 0;
}

.hero,
.section,
footer {
  width: min(1180px, calc(100% - 2rem));
  margin-inline: auto;
}

.hero {
  padding-bottom: 4rem;
}

.site-nav {
  min-height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.site-nav a {
  color: inherit;
  text-decoration: none;
}

.brand {
  font-weight: 750;
  letter-spacing: -.02em;
}

.site-nav__links {
  display: flex;
  gap: 1.25rem;
}

.site-nav__links a:hover,
.site-nav__links a:focus-visible {
  color: #1976d2;
}

.hero__content {
  max-width: 850px;
  padding: clamp(4rem, 10vw, 8rem) 0 2rem;
}

.eyebrow {
  margin: 0 0 .75rem;
  color: #1976d2;
  font-size: .8rem;
  font-weight: 750;
  letter-spacing: .13em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  text-wrap: pretty;
}

h1 {
  max-width: 800px;
  margin: 0;
  font-size: clamp(2.7rem, 7vw, 5.6rem);
  line-height: .98;
  letter-spacing: -.055em;
}

h2 {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 4vw, 3.3rem);
  line-height: 1.05;
  letter-spacing: -.035em;
}

.hero__summary,
.section-heading p,
.section--split > div:first-child > p:last-child,
.install > p {
  max-width: 700px;
  color: color-mix(in srgb, currentColor 72%, transparent);
  font-size: 1.08rem;
  line-height: 1.7;
}

.hero__summary {
  margin: 1.6rem 0 0;
  font-size: clamp(1.1rem, 2vw, 1.35rem);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  margin-top: 2rem;
}

.button {
  display: inline-flex;
  align-items: center;
  min-height: 2.8rem;
  padding: 0 1.1rem;
  border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
  border-radius: .55rem;
  color: inherit;
  font-weight: 650;
  text-decoration: none;
}

.button--primary {
  border-color: #1565c0;
  background: #1565c0;
  color: #fff;
}

.section {
  padding: 5rem 0;
}

.section--narrow {
  width: min(1040px, calc(100% - 2rem));
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.feature-grid article,
.demo-frame,
.recurrence-demo,
.install pre {
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, currentColor 3%, transparent);
}

.feature-grid article {
  padding: 1.5rem;
}

.feature-grid h3 {
  margin: 0 0 .5rem;
}

.feature-grid p {
  margin: 0;
  color: color-mix(in srgb, currentColor 70%, transparent);
  line-height: 1.65;
}

.section-heading,
.section--split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, .55fr);
  gap: 2rem;
  align-items: start;
}

.demo-controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
}

.demo-frame {
  margin-top: 2rem;
  padding: clamp(.35rem, 1.5vw, 1rem);
  overflow: hidden;
}

.recurrence-demo {
  padding: 1rem;
}

pre {
  overflow: auto;
  white-space: pre-wrap;
}

.recurrence-demo pre,
.install pre {
  margin: 1rem 0 0;
  padding: 1rem;
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: .9em;
}

footer {
  padding: 2rem 0 4rem;
  border-top: 1px solid color-mix(in srgb, currentColor 15%, transparent);
  color: color-mix(in srgb, currentColor 68%, transparent);
}

@media (max-width: 760px) {
  .site-nav__links {
    display: none;
  }

  .hero {
    padding-bottom: 2rem;
  }

  .feature-grid,
  .section-heading,
  .section--split {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 3.5rem 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    scroll-behavior: auto;
  }
}
</style>
