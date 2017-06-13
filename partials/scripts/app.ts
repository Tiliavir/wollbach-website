$(() => {
  const pathname: string = window.location.href;

  $("a").each((i: number, e: HTMLAnchorElement): void => {
    const $anchor: JQuery = $(e);
    const link: string = $anchor.attr("href");

    if (link.charAt(0) === "#") {
      $anchor.attr("href", pathname + link);
    }
  });

  $(".content").click(() => $("#navigation-checkbox").prop("checked", false));
});

function viewFullImage(url: string, alt: string): void {
  const $preview: JQuery = $(`<div class="overlay"><img class="full-view" src="${url}" alt="${alt}" /></div>`);
  $preview.click((e) => $(e.target).closest(".overlay").remove());
  $("body").append($preview);
}
