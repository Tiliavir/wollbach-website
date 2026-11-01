class App {
  public static fixAnchors(): void {
    const pathname = window.location.href.split("#")[0];
    $("a[href^='#']").each((i, e) => {
        const $elem = $(e);
        $elem.attr("href", pathname + $elem.attr("href"));
    });
  }

  public static initialize(): void {
    if (location.protocol !== 'https:' && !["localhost", "127.0.0.1"].includes(location.hostname)) {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }

    $(".content").on("click", () => $("#navigation-checkbox").prop("checked", false));

    App.fixAnchors();
    App.initDropdowns();
    App.refreshUpcoming();
  }

  // Desktop dropdowns open on hover/focus via CSS; this adds click/touch
  // support, Escape to close and keeps aria-expanded in sync.
  public static initDropdowns(): void {
    const dropdowns = Array.from(document.querySelectorAll<HTMLElement>(".dropdown"));
    const setOpen = (dropdown: HTMLElement, open: boolean) => {
      dropdown.classList.toggle("open", open);
      const toggle = dropdown.querySelector(".dropdown-toggle");
      if (toggle) {
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      }
    };

    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      if (!toggle) {
        return;
      }
      toggle.addEventListener("click", () => {
        const open = !dropdown.classList.contains("open");
        dropdowns.forEach((other) => setOpen(other, other === dropdown && open));
      });
      dropdown.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(dropdown, false);
          (toggle as HTMLElement).focus();
        }
      });
    });

    document.addEventListener("click", (e: MouseEvent) => {
      dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(e.target as Node)) {
          setOpen(dropdown, false);
        }
      });
    });
  }

  // "Kommende Termine" is rendered at build time; drop events that have
  // passed since the last deployment and re-apply the list limit.
  public static refreshUpcoming(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    document.querySelectorAll<HTMLElement>(".upcoming-events").forEach((list) => {
      const limit = Number(list.dataset.limit) || 0;
      let shown = 0;
      list.querySelectorAll<HTMLElement>(".upcoming-event").forEach((item) => {
        const [y, m, d] = (item.dataset.end || "").split("-").map(Number);
        const past = new Date(y, m - 1, d) < today;
        item.classList.toggle("is-past", past);
        if (!past) {
          shown++;
        }
        item.classList.toggle("is-extra", !past && limit > 0 && shown > limit);
      });
      const empty = list.querySelector<HTMLElement>(".upcoming-empty");
      if (empty) {
        empty.hidden = shown > 0;
      }
    });
  }
}

$(() => { App.initialize(); });
