namespace MVW {
  function fixAnchors(): void {
    const pathname = window.location.href.split("#")[0];
    $("a[href^='#']").each((i, e) => {
        const $elem = $(e);
        $elem.attr("href", pathname + $elem.attr("href"));
    });
  }

  function activateTabs(): void {
    function setActive(id: string) {
      $(".tab-pane").removeClass("active");
      $(".tab").removeClass("active");

      $(`.tab-${id}`).addClass("active");
      $(`#${id}`).addClass("active");
    }

    const url: string = window.location.href;

    const startIndex = url.indexOf("#") + 1;
    if (startIndex > 0) {
      setActive(url.substring(startIndex));
    }

    $(".tab").click((e: JQuery.ClickEvent) => {
      setActive($(e.target).data("tab"));
      e.stopPropagation();
    });
  }

  export function viewFullImage(url: string, alt: string): void {
    const $preview: JQuery = $(`<div class="overlay"><img class="full-view" src="${url}" alt="${alt}" /></div>`);
    $preview.click((e) => $(e.target).closest(".overlay").remove());
    $("body").append($preview);
  }

  export function inititialize(): void {
    $(".content").click(() => $("#navigation-checkbox").prop("checked", false));

    fixAnchors();
    activateTabs();
  }

  $(() => MVW.inititialize());
}
