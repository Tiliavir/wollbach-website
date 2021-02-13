interface HTMLElementWithVisibility extends HTMLElement {
    isVisible: boolean;
}

class Appointments {
  public static addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  }

  public static slideUp(): void {
    $(".passed")
      .find("td")
      .css("padding", "0")
      .wrapInner("<div/>")
      .parent()
      .find("td > div")
      .slideUp(500, () => {
        $(".passed")
          .addClass("collapsed")
          .find("td > div > *")
          .unwrap();
      });
  }

  public static slideDown(): void {
    const $passed = $(".passed");
    $passed.removeClass("collapsed");

    $passed.find("td")
           .css("padding", "10px")
           .wrapInner("<div style='display: none' />")
           .parent()
           .find("td > div")
           .slideDown(500, () => {
             $(".passed td > div > *").unwrap();
           });
  }

  public static init(): void {
    const cutOffDate = Appointments.addDays(new Date(), -3);
    let hasPassedItems = false;

    $("meta[itemprop=\"startDate\"]").each((i, e) => {
      let $e = $(e);
      const $endDateString = $e.siblings("meta[itemprop=\"endDate\"]");
      $e = $endDateString.length === 1 ? $endDateString : $e;
      const endDate = new Date($e.attr("content"));
      if (endDate < cutOffDate) {
        $e.closest("tr").addClass("passed").addClass("collapsed");
        hasPassedItems = true;
      }
    });

    if (hasPassedItems) {
      const row = "<tr><td colspan='3' class='show-passed'>vergangene Termine</td></tr>";
      const $showMore: JQuery = $(".appointments tbody").prepend($(row)).find(".show-passed");
      (<HTMLElementWithVisibility>$showMore[0]).isVisible = false;
      $showMore.on("click", (e) => {
        if ((e.target as HTMLElementWithVisibility).isVisible) {
          Appointments.slideUp();
        } else {
          Appointments.slideDown();
        }
        (e.target as HTMLElementWithVisibility).isVisible = !(e.target as HTMLElementWithVisibility).isVisible;
      });
    }
  }
}

$(() => { Appointments.init(); });
