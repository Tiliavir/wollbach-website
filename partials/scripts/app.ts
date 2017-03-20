$(() => {
  let pathname: string = window.location.href;

  $("a").each((i: number, e: HTMLAnchorElement): void => {
    let $anchor: JQuery = $(e);
    let link: string = $anchor.attr("href");

    if (link.charAt(0) === "#") {
      $anchor.attr("href", pathname + link);
    }
  });
});

function viewFullImage(url: string, alt: string) {
  let $preview = $(`<div class="overlay"><img class="full-view" src="${url}" alt="${alt}" /></div>`);
  $("body").append($preview);
};
