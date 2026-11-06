// Month-grid calendar for the Veranstaltungskalender page.
// Data comes from the JSON blob rendered by layouts/shortcodes/kalender.html.
// Desktop cells show event titles; on small screens cells show dots and the
// selected day's events are listed below the grid.

interface CalendarEvent {
  start: string;
  end: string;
  title: string;
  organizer: string;
  location: string;
  description: string;
}

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];
const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MAX_CHIPS = 2;

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(value: string): Date {
  const [y, m, d] = value.substring(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function timeOf(value: string): string {
  const match = /T(\d{2}:\d{2})/.exec(value);
  return match ? `${match[1]} Uhr` : "";
}

function longDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text) {
    node.textContent = text;
  }
  return node;
}

// ", 2 Termine" / ", 1 Termin" / "" - appended to a day's accessible name
function eventCountLabel(count: number): string {
  if (!count) {
    return "";
  }
  const noun = count === 1 ? "Termin" : "Termine";
  return `, ${count} ${noun}`;
}

function outsideCell(date: Date): HTMLElement {
  const filler = el("div", "calendar-day is-outside");
  filler.setAttribute("aria-hidden", "true");
  filler.appendChild(el("span", "calendar-num", String(date.getDate())));
  return filler;
}

// desktop: up to MAX_CHIPS titles plus "+n weitere"
function eventChips(events: CalendarEvent[]): HTMLElement {
  const chips = el("span", "calendar-chips");
  chips.setAttribute("aria-hidden", "true");
  events.slice(0, MAX_CHIPS).forEach((ev) => chips.appendChild(el("span", "calendar-chip", ev.title)));
  if (events.length > MAX_CHIPS) {
    chips.appendChild(el("span", "calendar-more", `+${events.length - MAX_CHIPS} weitere`));
  }
  return chips;
}

// phones: up to three dots
function eventDots(count: number): HTMLElement {
  const dots = el("span", "calendar-dots");
  dots.setAttribute("aria-hidden", "true");
  for (let i = 0; i < Math.min(count, 3); i++) {
    dots.appendChild(el("span", "calendar-dot"));
  }
  return dots;
}

class Calendar {
  private readonly byDay = new Map<string, CalendarEvent[]>();
  private readonly title: HTMLElement;
  private readonly grid: HTMLElement;
  private readonly detail: HTMLElement;
  private readonly today = new Date();
  private year: number;
  private month: number;
  private selected: string;

  constructor(root: HTMLElement, events: CalendarEvent[]) {
    this.title = root.querySelector("#calendar-title") as HTMLElement;
    this.grid = root.querySelector("[data-calendar-grid]") as HTMLElement;
    this.detail = root.querySelector("[data-calendar-detail]") as HTMLElement;

    // index every day an event covers (multi-day events appear on each day)
    for (const event of events) {
      const end = parseDate(event.end);
      for (let d = parseDate(event.start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = isoDate(d);
        const list = this.byDay.get(key) || [];
        list.push(event);
        this.byDay.set(key, list);
      }
    }

    this.year = this.today.getFullYear();
    this.month = this.today.getMonth();
    this.selected = isoDate(this.today);

    (root.querySelector("[data-calendar-prev]") as HTMLElement).addEventListener("click", () => this.shift(-1));
    (root.querySelector("[data-calendar-next]") as HTMLElement).addEventListener("click", () => this.shift(1));
    (root.querySelector("[data-calendar-today]") as HTMLElement).addEventListener("click", () => {
      this.year = this.today.getFullYear();
      this.month = this.today.getMonth();
      this.select(isoDate(this.today), true);
    });
    this.grid.addEventListener("keydown", (e: KeyboardEvent) => this.onKey(e));

    root.hidden = false;
    this.render();
  }

  private shift(delta: number): void {
    const target = new Date(this.year, this.month + delta, 1);
    this.year = target.getFullYear();
    this.month = target.getMonth();
    // select the first day with events in the new month, else the 1st
    const days = new Date(this.year, this.month + 1, 0).getDate();
    let pick = isoDate(target);
    for (let day = 1; day <= days; day++) {
      const key = isoDate(new Date(this.year, this.month, day));
      if (this.byDay.has(key)) {
        pick = key;
        break;
      }
    }
    this.selected = pick;
    this.render();
  }

  private select(key: string, focus: boolean): void {
    const d = parseDate(key);
    if (d.getFullYear() !== this.year || d.getMonth() !== this.month) {
      this.year = d.getFullYear();
      this.month = d.getMonth();
    }
    this.selected = key;
    this.render();
    if (focus) {
      const cell = this.grid.querySelector(`[data-date="${key}"]`) as HTMLElement | null;
      if (cell) {
        cell.focus();
      }
    }
  }

  private onKey(e: KeyboardEvent): void {
    const steps: { [key: string]: number } = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!(e.key in steps)) {
      return;
    }
    e.preventDefault();
    const d = parseDate(this.selected);
    d.setDate(d.getDate() + steps[e.key]);
    this.select(isoDate(d), true);
  }

  private render(): void {
    this.title.textContent = `${MONTHS[this.month]} ${this.year}`;
    this.grid.textContent = "";

    const first = new Date(this.year, this.month, 1);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const days = new Date(this.year, this.month + 1, 0).getDate();
    const cells = Math.ceil((offset + days) / 7) * 7;
    const todayKey = isoDate(this.today);

    for (let i = 0; i < cells; i++) {
      const date = new Date(this.year, this.month, i - offset + 1);
      const cell = date.getMonth() === this.month ? this.dayCell(date, todayKey) : outsideCell(date);
      this.grid.appendChild(cell);
    }

    this.renderDetail();
  }

  private dayCell(date: Date, todayKey: string): HTMLButtonElement {
    const key = isoDate(date);
    const events = this.byDay.get(key) || [];
    const isSelected = key === this.selected;

    const cell = el("button", "calendar-day");
    cell.type = "button";
    cell.dataset.date = key;
    cell.tabIndex = isSelected ? 0 : -1;
    cell.setAttribute("aria-pressed", String(isSelected));
    cell.setAttribute("aria-label", longDate(date) + eventCountLabel(events.length));
    if (key === todayKey) {
      cell.classList.add("is-today");
      cell.setAttribute("aria-current", "date");
    }

    cell.appendChild(el("span", "calendar-num", String(date.getDate())));
    if (events.length) {
      cell.classList.add("has-events");
      cell.appendChild(eventChips(events));
      cell.appendChild(eventDots(events.length));
    }

    // re-rendering replaces the button, so restore focus for keyboard use
    cell.addEventListener("click", () => this.select(key, true));
    return cell;
  }

  private renderDetail(): void {
    this.detail.textContent = "";
    const date = parseDate(this.selected);
    if (date.getMonth() !== this.month) {
      return;
    }
    const events = this.byDay.get(this.selected) || [];
    this.detail.appendChild(el("h3", "calendar-detail-title", longDate(date)));

    if (!events.length) {
      this.detail.appendChild(el("p", "calendar-detail-empty", "Keine Termine an diesem Tag."));
      return;
    }

    const list = el("ul", "calendar-detail-list");
    for (const ev of events) {
      const item = el("li", "calendar-detail-item");
      item.appendChild(el("span", "event-title", ev.title));
      const meta: string[] = [];
      const time = timeOf(ev.start);
      if (time) {
        meta.push(time);
      }
      if (ev.start.substring(0, 10) !== ev.end.substring(0, 10)) {
        const s = parseDate(ev.start);
        const e = parseDate(ev.end);
        meta.push(`${s.getDate()}.${s.getMonth() + 1}. – ${e.getDate()}.${e.getMonth() + 1}.`);
      }
      if (ev.organizer) {
        meta.push(ev.organizer);
      }
      if (ev.location) {
        meta.push(ev.location);
      }
      if (meta.length) {
        item.appendChild(el("span", "event-meta", meta.join(" · ")));
      }
      if (ev.description) {
        item.appendChild(el("span", "event-meta", ev.description));
      }
      list.appendChild(item);
    }
    this.detail.appendChild(list);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-calendar]") as HTMLElement | null;
  const data = document.querySelector("[data-calendar-events]");
  if (!root || !data?.textContent) {
    return;
  }
  try {
    new Calendar(root, JSON.parse(data.textContent) as CalendarEvent[]);
  } catch (err) {
    console.error("Kalender konnte nicht geladen werden", err);
  }
});
