namespace KW.Search {
  let index: any;
  let store: any;

  function handleSearch(): void {
    const query = $("input.mvw-search-field").val();

    const result = index.search(`*${query}*`);

    const resultContainer = $(".results");
    if (!query || result.length === 0) {
      resultContainer.hide();
    } else {
      resultContainer.empty();
      for (const item in result) {
        if (result.hasOwnProperty(item)) {
          const ref = result[item].ref;
          const i = `
          <li>
            <div>
              <a href="${ref}.html">
                ${store[ref].title}
              </a>
            </div>
            <span>${store[ref].description}</span>
          </li>`;
          resultContainer.append(i);
        }
      }
      resultContainer.show();
    }
  }

  function getParameterByName(name: string): string {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) {
      return null;
    }

    if (!results[2]) {
      return "";
    }

    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  export function init(): void {
    $.getJSON("/index.json", (data) => {
      index = lunr.Index.load(data.index);
      store = data.store;

      const query = getParameterByName("query") || getParameterByName("q");
      const inputField = $("input.mvw-search-field");
      if (query) {
        inputField.val(query);
      }
      inputField.on("keyup", handleSearch);
      handleSearch();
    });
  }
}

$(() => KW.Search.init());
