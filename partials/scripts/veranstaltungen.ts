module KW.Appointments {
  function addDays(date: Date, days: number): Date {
    let result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  }

  function slideUp(): void {
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

  function slideDown(): void {
    $(".passed").removeClass("collapsed");

    $(".passed")
      .find("td")
      .css("padding", "10px")
      .wrapInner("<div style='display: none' />")
      .parent()
      .find("td > div")
      .slideDown(500, () => {
        $(".passed td > div > *").unwrap();
      });
  }

  export function init(): void {
    const cutOffDate = addDays(new Date(), -3);
    let hasPassedItems: boolean = false;

    $("meta[itemprop=\"startDate\"]").each((i, e) => {
      let $e = $(e);
      let $endDateString = $e.siblings("meta[itemprop=\"endDate\"]");
      $e = $endDateString.length === 1 ? $endDateString : $e;
      let endDate = new Date($e.attr("content"));
      if (endDate < cutOffDate) {
        $e.closest("tr").addClass("passed").addClass("collapsed");
        hasPassedItems = true;
      }
    });

    if (hasPassedItems) {
      let row = "<tr><td colspan='3' class='show-passed'>vergangene Termine</td></tr>";
      let $showMore: JQuery = $(".appointments tbody").prepend($(row));
      (<any> $showMore[0]).isVisible = false;
      $showMore.click((e: Event) => {
        if ((<any> e.target).isVisible) {
          slideUp();
        } else {
          slideDown();
        }
        (<any> e.target).isVisible = !(<any> e.target).isVisible;
      });
    }
  }
}

$(() => { KW.Appointments.init(); });
