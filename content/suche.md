---
title: Suche
description: Durchsuche die Inhalte der Webseite Wollbachs.
keywords: [Suche, Seitensuche]
schemaOrg: SearchResultsPage
customJs:
  - ts/suche.ts
customCss:
  - scss/suche.scss
menu:
  footer:
    weight: 200
---

<form itemprop="potentialAction" itemscope itemtype="https://schema.org/SearchAction">
  <meta itemprop="target" content="https://www.wollbach.info/suche/?q={query}" />
  <input class="mvw-search-field" itemprop="query-input" placeholder="Suche..." type="search" name="query" />
</form>

<ol class="results">
</ol>
