# Test: formatTimespan

``` pug
mixin formatTimespan(starttime, endtime, printSchemaOrgMeta)
  -
    var start = moment.utc(starttime);
    var end = moment.utc(endtime || starttime);
    var dateString;
    var con = 0;
    
    function isBeginningOfDay(dt) {
      return moment(dt).diff(moment(dt).startOf("day")) == 0
    }

    if (start.isSame(end, "d")) {
      dateString = start.format("DD.MM.YYYY");
      if (!isBeginningOfDay(start)) {
        if (!start.isSame(end) && !isBeginningOfDay(end)) {
          dateString += ` ${start.format("HH:mm")} - ${end.format("HH:mm")}`;
        } else {
          dateString += ` ${start.format("HH:mm")}`;
        }
      }
    } else if (start.clone().add(1, "d").isSame(end, "d")) {
      dateString = `${start.format("DD.")} & ${end.format("DD.MM.YYYY")}`;
    } else {
      dateString = `${start.format("DD.MM.")} - ${end.format ("DD.MM.YYYY")}`;
    }

  if printSchemaOrgMeta
    if !isBeginningOfDay(start)
      meta(itemprop="startDate" content=starttime)
    else
      meta(itemprop="startDate" content=start.format('YYYY-MM-DD'))
    if !isBeginningOfDay(end) && !start.isSame(end)
      meta(itemprop="endDate" content=end)
    else
      meta(itemprop="endDate" content=end.format('YYYY-MM-DD'))
  = dateString
  
html
  head
    style p { margin: 0; }
  body
    p DATES

    p 01.01.2017
    +formatTimespan("2017-01-01", "2017-01-01", true)
    
    p 01.01.2017
    +formatTimespan("2017-01-01", undefined, true)
    
    p 01.01.2017
    +formatTimespan("2017-01-01T00:00:00", "2017-01-01T00:00:00", true)
    
    p 01.01.2017
    +formatTimespan("2017-01-01T00:00:00", undefined, true)
    
    p 01. & 02.01.2017
    +formatTimespan("2017-01-01", "2017-01-02", true)
    
    p 01. & 02.01.2017
    +formatTimespan("2017-01-01T00:00:00", "2017-01-02T00:00:00", true)
    
    p 01.01. - 03.01.2017
    +formatTimespan("2017-01-01T00:00:00", "2017-01-03T00:00:00", true)
    
    p 01.01. - 02.02.2017
    +formatTimespan("2017-01-01T00:00:00", "2017-02-02T00:00:00", true)
    
    p TIMES
    
    p 01.01.2017 16:30
    +formatTimespan("2017-01-01T16:30:00", "2017-01-01", true)
    
    p 01.01.2017 16:40
    +formatTimespan("2017-01-01T16:40", undefined, true)
    
    p 01.01.2017 17:00 - 18:00
    +formatTimespan("2017-01-01T17:00:00", "2017-01-01T18:00:00", true)
    
    p 01.01.2017
    +formatTimespan("2017-01-01T00:00:00", "2017-01-01T18:00:00", true)
    
    p 01.01.2017 16:00
    +formatTimespan("2017-01-01T16:00:00", "2017-01-01T16:00:00", true)
    
    p 01.01. - 02.02.2017
    +formatTimespan("2017-01-01T17:30:00", "2017-02-02T22:00:00", true)
```