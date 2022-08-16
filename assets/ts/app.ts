class App {
  public static fixAnchors(): void {
    const pathname = window.location.href.split("#")[0];
    $("a[href^='#']").each((i, e) => {
        const $elem = $(e);
        $elem.attr("href", pathname + $elem.attr("href"));
    });
  }

  public static initializeImageEnlarger(): void {
    const $img = $("figure .img");
    $img.on("click", () => App.viewFullImage($img.data("src")))
  }

  public static activateTabs(): void {
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

    $(".tab").on("click", (e: JQuery.ClickEvent) => {
      setActive($(e.target).data("tab"));
      e.stopPropagation();
    });
  }

  public static viewFullImage(url: string, alt?: string): void {
    const $preview: JQuery = $(`<div class="overlay"><img class="full-view" src="${url}" alt="${alt}" /></div>`);
    $preview.on("click", (e) => $(e.target).closest(".overlay").remove());
    $("body").append($preview);
  }

  public static initialize(): void {
    if (location.protocol !== 'https:') {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }

    $(".content").on("click", () => $("#navigation-checkbox").prop("checked", false));

    App.fixAnchors();
    App.activateTabs();
    App.initializeImageEnlarger();
  }
}

$(() => { App.initialize(); });
