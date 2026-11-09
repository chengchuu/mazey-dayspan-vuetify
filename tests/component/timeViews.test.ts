import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import MdDayView from "../../src/components/MdDayView.vue";
import MdMonthView from "../../src/components/MdMonthView.vue";
import MdWeekView from "../../src/components/MdWeekView.vue";
import { createMazeyDaySpanContext, mazeyDaySpanKey } from "../../src/plugin/context";
import type { CalendarEvent } from "../../src/types";

const global = {
  provide: {
    [mazeyDaySpanKey as symbol]: createMazeyDaySpanContext(),
  },
};
const props = {
  date: new Date(2026, 6, 10),
  events: [],
};

describe("time view accessibility", () => {
  it("labels the day grid as a day", () => {
    const wrapper = mount(MdDayView, { props, global });

    expect(wrapper.get("[role=\"grid\"]").attributes("aria-label")).toBe("Day");
  });

  it("labels the week grid as a week", () => {
    const wrapper = mount(MdWeekView, { props, global });

    expect(wrapper.get("[role=\"grid\"]").attributes("aria-label")).toBe("Week");
  });

  it("requests month-view event creation with Shift+Enter", async () => {
    const wrapper = mount(MdMonthView, { props, global });
    const dateButton = wrapper.get(".md-month__date");

    await dateButton.trigger("keydown", { key:"Enter", shiftKey:true });

    expect(dateButton.attributes("aria-keyshortcuts")).toBe("Shift+Enter Shift+Space");
    expect(wrapper.emitted("eventCreateRequest")).toHaveLength(1);
  });

  it("requests week-view event creation with Shift+Space", async () => {
    const wrapper = mount(MdWeekView, { props, global });
    const dayHeading = wrapper.get(".md-time-grid__heading");

    await dayHeading.trigger("keydown", { key:" ", shiftKey:true });

    expect(dayHeading.attributes("aria-keyshortcuts")).toBe("Shift+Enter Shift+Space");
    expect(wrapper.emitted("eventCreateRequest")).toHaveLength(1);
  });

  it("clamps cross-midnight timed events to the current day column", () => {
    const events:CalendarEvent[] = [{
      id: "overnight",
      title: "Overnight event",
      start: new Date(2026, 6, 9, 22),
      end: new Date(2026, 6, 10, 2),
    }];
    const wrapper = mount(MdWeekView, {
      props: { date:new Date(2026, 6, 10), events },
      global,
    });
    const currentDay = wrapper.findAll(".md-time-grid__day")[5];

    expect(currentDay).toBeDefined();
    expect(currentDay!.get(".md-time-event").attributes("style")).toContain("top: 0px");
    expect(currentDay!.get(".md-time-event").attributes("style")).toContain("height: 96px");
  });

  it("positions timed events by local wall-clock time across DST changes", () => {
    const originalTimezone = process.env.TZ;
    process.env.TZ = "America/New_York";

    try {
      const events:CalendarEvent[] = [{
        id:"dst-event",
        title:"After the DST jump",
        start:new Date(2026, 2, 8, 3),
        end:new Date(2026, 2, 8, 4),
      }];
      const wrapper = mount(MdDayView, {
        props: { date:new Date(2026, 2, 8), events },
        global,
      });
      const style = wrapper.get(".md-time-event").attributes("style");

      expect(style).toContain("top: 144px");
      expect(style).toContain("height: 48px");
    } finally {
      if (originalTimezone === undefined) delete process.env.TZ;
      else process.env.TZ = originalTimezone;
    }
  });

  it("applies the configured hour height to the hourly track and grid token", () => {
    const context = createMazeyDaySpanContext({ defaults:{ hourHeight:64 } });
    const wrapper = mount(MdDayView, {
      props,
      global:{ provide:{ [mazeyDaySpanKey as symbol]:context } },
    });
    const track = wrapper.get(".md-time-grid__track");

    expect(track.attributes("style")).toContain("height: 1536px");
    expect(track.attributes("style")).toContain("--md-hour-height: 64px");
  });

  it("aligns the repeating hourly grid with the configured track token", () => {
    const styles = readFileSync(resolve("src/styles/main.scss"), "utf8");
    const [, gridRule] = styles.match(/\.md-time-grid\{([^}]*)\}/)!;
    const [, trackRule] = styles.match(/\.md-time-grid__track\{([^}]*)\}/)!;

    expect(gridRule).not.toContain("repeating-linear-gradient");
    expect(trackRule).toContain("repeating-linear-gradient");
    expect(trackRule).toContain("var(--md-hour-height)");
  });

  it("renders multi-day all-day events in each intersected week band", async () => {
    const events:CalendarEvent[] = [{
      id:"conference",
      title:"Conference",
      start:new Date(2026, 6, 9),
      end:new Date(2026, 6, 11),
      allDay:true,
    }];
    const wrapper = mount(MdWeekView, {
      props: { date:new Date(2026, 6, 10), events },
      slots: { event:"<span class=\"all-day-slot\">Custom all-day event</span>" },
      global,
    });
    const entries = wrapper.findAll(".md-time-grid__all-day-event");

    expect(entries).toHaveLength(2);
    expect(wrapper.findAll(".all-day-slot")).toHaveLength(2);
    expect(entries.every((entry) => entry.attributes("aria-label") === "Conference, All day")).toBe(true);
    await entries[0]!.trigger("click");
    expect(wrapper.emitted("eventClick")).toHaveLength(1);
  });

  it("renders an all-day event in day view", () => {
    const events:CalendarEvent[] = [{
      id:"holiday",
      title:"Holiday",
      start:new Date(2026, 6, 10),
      end:new Date(2026, 6, 11),
      allDay:true,
    }];
    const wrapper = mount(MdDayView, {
      props: { date:new Date(2026, 6, 10), events },
      global,
    });

    expect(wrapper.get(".md-time-grid__all-day-event").attributes("aria-label")).toBe("Holiday, All day");
    expect(wrapper.find(".md-time-event").exists()).toBe(false);
  });

  it("labels month-view all-day events without announcing midnight", () => {
    const events:CalendarEvent[] = [{
      id:"holiday",
      title:"Holiday",
      start:new Date(2026, 6, 10),
      end:new Date(2026, 6, 11),
      allDay:true,
    }];
    const wrapper = mount(MdMonthView, {
      props: { date:new Date(2026, 6, 10), events },
      global,
    });

    expect(wrapper.get(".md-event").attributes("aria-label")).toBe("Holiday, All day");
  });
});
