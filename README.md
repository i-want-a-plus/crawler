# crawler

![illinois-logo](https://courses.illinois.edu/static/images/Illinois-Logo.png)

This crawler is for [UIUC Course Explorer](https://courses.illinois.edu).

## Setup

```
# install the dependencies
npm i
```

## Crawling the catelog

```
# create and sync the db
node model.js

# start crawling the catelog
node catalog.js --db

# or you wish to save to json file
node catelog.js --file=data.json

# or to specify the endpoint. This will only update part of data.
node catelog.js --db --endpoint=2018
node catelog.js --db --endpoint=2018/spring
```