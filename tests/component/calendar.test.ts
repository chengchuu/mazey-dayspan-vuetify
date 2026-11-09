import { mount } from "@vue/test-utils";
import { h } from "vue";
import {
  afterEach, describe, expect, it, vi,
} from "vitest";
import MdCalendar from "../../src/components/MdCalendar.vue";
import MdCalendarApp from "../../src/components/MdCalendarApp.vue";
import { dateKey } from "../../src/core/date";
import { createMazeyDaySpanContext, mazeyDaySpanKey } from "../../src/plugin/context";
import type { CalendarEvent, CalendarRange } from "../../src/types";

const events: CalendarEvent[] = [{
  id: "safe",
  title: "<img src=x onerror=alert(1)>",
  description: "<script>alert(1)</script>",
  start: new Date(2026, 6, 10, 9),
  end: new Date(2026, 6, 10, 10),
}];
const global = { provide:{ [mazeyDaySpanKey as symbol]:createMazeyDaySpanContext() } };
const mountCalendar = () => mount(MdCalendar, {
  props: { events, modelValue:new Date(2026, 6, 10), view:"month" },
  global,
});

afterEach(() => vi.useRealTimers());

describe("MdCalendar", () => {
  it("renders event content as text and emits typed interaction events", async () => {
    const wrapper = mountCalendar();
    expect(wrapper.html()).toContain("&lt;img");
    expect(wrapper.find("img").exists()).toBe(false);
    await wrapper.find(".md-event").trigger("click");
    expect(wrapper.emitted("eventClick")).toHaveLength(1);
  });

  it("navigates and changes views accessibly", async () => {
    const wrapper = mountCalendar();
    await wrapper.get("[aria-label=\"Next\"]").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    const week = wrapper.findAll(".md-toolbar__views button")[1]!;
    await week.trigger("click");
    expect(wrapper.emitted("viewChange")?.[0]).toEqual(["week"]);
  });

  it("emits the new visible range when returning to today", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 18, 12));
    const wrapper = mountCalendar();

    await wrapper.get(".md-toolbar__nav button:nth-child(2)").trigger("click");

    const range = wrapper.emitted("rangeChange")?.[0]?.[0] as CalendarRange;
    expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    expect(dateKey(range.start)).toBe("2026-11-01");
    expect(dateKey(range.end)).toBe("2026-12-13");
  });

  it("renders a custom event slot", () => {
    const wrapper = mount(MdCalendar, {
      props: { events, modelValue:new Date(2026, 6, 10), view:"month" },
      slots: { event:"<span class=\"custom\">custom</span>" },
      global,
    });
    expect(wrapper.find(".custom").text()).toBe("custom");
  });

  it("preserves built-in agenda event and empty fallbacks when slots are omitted", async () => {
    const withEvent = mount(MdCalendar, { props:{ events, modelValue:new Date(2026, 6, 10), view:"agenda" }, global });
    expect(withEvent.get(".md-agenda__event").text()).toContain(events[0]!.title);

    const empty = mount(MdCalendar, { props:{ events:[], modelValue:new Date(2026, 6, 10), view:"agenda" }, global });
    expect(empty.get(".md-empty").text()).toBe("No events");
  });

  it("forwards calendar-app date navigation through update:date", async () => {
    const wrapper = mount(MdCalendarApp, { props:{ events, date:new Date(2026, 6, 10) }, global });
    await wrapper.get("[aria-label=\"Next\"]").trigger("click");
    expect(dateKey(wrapper.emitted("update:date")?.[0]?.[0] as Date)).toBe("2026-08-01");
  });

  it("uses the plugin default view only when the view prop is omitted", () => {
    const weekContext = createMazeyDaySpanContext({ defaults:{ view:"week" } });
    const weekGlobal = { provide:{ [mazeyDaySpanKey as symbol]:weekContext } };
    const defaulted = mount(MdCalendar, {
      props: { events:[], modelValue:new Date(2026, 6, 10) },
      global:weekGlobal,
    });
    const explicit = mount(MdCalendar, {
      props: { events:[], modelValue:new Date(2026, 6, 10), view:"month" },
      global:weekGlobal,
    });
    const appDefaulted = mount(MdCalendarApp, {
      props: { events:[], date:new Date(2026, 6, 10) },
      global:weekGlobal,
    });
    const appExplicit = mount(MdCalendarApp, {
      props: { events:[], date:new Date(2026, 6, 10), view:"month" },
      global:weekGlobal,
    });

    expect(defaulted.find(".md-time-grid--week").exists()).toBe(true);
    expect(explicit.find(".md-month").exists()).toBe(true);
    expect(appDefaulted.find(".md-time-grid--week").exists()).toBe(true);
    expect(appExplicit.find(".md-month").exists()).toBe(true);
  });

  it("uses agendaDays for display, emitted ranges, and navigation", async () => {
    const agendaEvents:CalendarEvent[] = [10, 12, 13].map((day) => ({
      id:`event-${day}`,
      title:`Event ${day}`,
      start:new Date(2026, 6, day, 9),
      end:new Date(2026, 6, day, 10),
    }));
    const context = createMazeyDaySpanContext({ defaults:{ agendaDays:3 } });
    const wrapper = mount(MdCalendar, {
      props: { events:agendaEvents, modelValue:new Date(2026, 6, 10), view:"agenda" },
      global:{ provide:{ [mazeyDaySpanKey as symbol]:context } },
    });

    expect(wrapper.findAll(".md-agenda__event")).toHaveLength(2);
    await wrapper.get("[aria-label=\"Next\"]").trigger("click");

    expect(dateKey(wrapper.emitted("update:modelValue")?.[0]?.[0] as Date)).toBe("2026-07-13");
    const emittedRange = wrapper.emitted("rangeChange")?.[0]?.[0] as CalendarRange;
    expect(dateKey(emittedRange.start)).toBe("2026-07-13");
    expect(dateKey(emittedRange.end)).toBe("2026-07-16");
  });

  it("forwards empty slot scope through the calendar with and without a day", () => {
    const empty = ({ day }:{ day?:{ key:string } }) => h("span", { class:"empty-scope" }, day?.key ?? "none");
    const month = mount(MdCalendar, {
      props: { events:[], modelValue:new Date(2026, 6, 10), view:"month" },
      slots: { empty },
      global,
    });
    const agenda = mount(MdCalendar, {
      props: { events:[], modelValue:new Date(2026, 6, 10), view:"agenda" },
      slots: { empty },
      global,
    });

    expect(month.findAll(".empty-scope").some((item) => item.text() === "2026-07-10")).toBe(true);
    expect(agenda.get(".empty-scope").text()).toBe("none");
  });

  it("forwards empty slot scope through the calendar app with and without a day", () => {
    const empty = ({ day }:{ day?:{ key:string } }) => h("span", { class:"empty-scope" }, day?.key ?? "none");
    const month = mount(MdCalendarApp, {
      props: { events:[], date:new Date(2026, 6, 10), view:"month" },
      slots: { empty },
      global,
    });
    const agenda = mount(MdCalendarApp, {
      props: { events:[], date:new Date(2026, 6, 10), view:"agenda" },
      slots: { empty },
      global,
    });

    expect(month.findAll(".empty-scope").some((item) => item.text() === "2026-07-10")).toBe(true);
    expect(agenda.get(".empty-scope").text()).toBe("none");
  });
});
