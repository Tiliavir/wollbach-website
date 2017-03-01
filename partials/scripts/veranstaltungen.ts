module KW.Appointments {
  function addDays(date: Date, days: number): Date {
    let result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  }

  export function initialize(): void {
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
      let row = "<tr><td colspan='2' class='show-passed'>vergangene Termine</td></tr>";
      let $showMore: JQuery = $(".appointments tbody").prepend($(row));
      $showMore.click((e: Event) => $(".passed").toggleClass("collapsed"));
    }
  }
}

$(() => { KW.Appointments.initialize(); });
