# Website: Wollbach
[![Build State](https://github.com/Tiliavir/wollbach-website/workflows/CI/badge.svg)](https://github.com/Tiliavir/wollbach-website/actions)

## Convert schedule Excel to Json

```bash
 $ jq -Rsn '
  {"2024":
    [inputs
     | . / "\n"
     | (.[] | select(length > 0) | . / ",") as $input
     | {"starttime": "2024-\($input[1])-\($input[2])", "title": $input[3], "organizer": $input[4], "location": {"name": $input[5], "address": ""}}]}
' <termine.csv > termine.json
```

## Prerequisites
[Install the extended / SCSS version of Hugo](https://gohugo.io/getting-started/installing/).

If you are on Ubuntu, download and install from [gohugoio releases on GitHub](https://github.com/gohugoio/hugo/releases/).
Take the latest `hugo_extended_*_Linux-64bit.deb` package.

## Debug / Test Build
```bash
hugo serve
```

## Deploy
Deployment happens automatically on tag on master.
