# 🍎 🍏 🍎 🍏 apples 🍎 🍏 🍎 🍏

Elasticsearch apples exercise

## 1. Create index with mappings 📝

```

# Clean start

DELETE grocery-store

# Create mapping

PUT grocery-store
{
  "settings": {
    "analysis": {
      "analyzer": {
        "analyzer_lowercase_exactwords": {
          "tokenizer": "remove_whitespace_commas",
          "filter": "lowercase"
        },
        "compound_words": {
          "tokenizer": "whitespace",
          "filter": [
            "lowercase",
            "dictionary_decompounder"
          ]
        }
      },
      "filter": {
        "dictionary_decompounder": {
          "type": "dictionary_decompounder",
          "word_list": [
            "eple"
          ]
        }
      },
      "tokenizer": {
        "remove_whitespace_commas": {
          "type": "char_group",
          "tokenize_on_chars": [
            "whitespace",
            ","
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "category": {
        "type": "keyword"
      },
      "subCategory": {
        "type": "keyword"
      },
      "title": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          },
          "lowercase_exactwords": {
            "type": "text",
            "analyzer": "analyzer_lowercase_exactwords"
          },
          "norwegian": {
            "type": "text",
            "analyzer": "norwegian"
          },
          "compound_words": {
            "type": "text",
            "analyzer": "compound_words"
          }
        }
      }
    }
  }
}

# Index data into index

POST grocery-store/_bulk
{"index":{"_id":1}}
{"title": "Eple og Ingefærjuice", "category": "Juice og fruktdrikker", "subCategory": "Frukt- og bærjuice"}
{"index":{"_id":2}}
{"title": "Grans Taffel Eple", "category": "Vann og mineralvann", "subCategory": "Vann med kullsyre"}
{"index":{"_id":3}}
{"title": "Røde epler i pose", "category": "Frukt", "subCategory": "Epler og pærer"}
{"index":{"_id":4}}
{"title": "Eplejuice", "category": "Juice og fruktdrikker", "subCategory": "Eplejuice"}
{"index":{"_id":5}}
{"title": "Mozell Eplemost", "category": "Juice og fruktdrikker", "subCategory": "Eplejuice"}
{"index":{"_id":6}}
{"title": "Epler, røde, 6 pk", "category": "Frukt", "subCategory": "Epler og pærer"}
{"index":{"_id":7}}
{"title": "Epler, grønne, 6 pk", "category": "Frukt", "subCategory": "Epler og pærer"}
{"index":{"_id":8}}
{"title": "Pink Lady Epler","category": "Frukt", "subCategory": "Epler og pærer"}
{"index":{"_id":9}}
{"title": "Nora Eple & pære UTS", "category": "Syltetøy", "subCategory": "Syltetøy"}

# Verify data and mappings

GET grocery-store/_search

GET grocery-store/_mapping

```

## 2. Individual searches 🔦

### 2.1

```
# exact match for "epler" in title field at start of phrase

GET grocery-store/_search
{
  "query": {
    "prefix": {
      "title.keyword": {
        "value": "epler",
        "case_insensitive": true,
        "boost": 3
      }
    }
  }
}
```

### 2.2

```
# exact match for "epler" in title field anywhere in phrase

GET grocery-store/_search/
{
  "query": {
    "match": {
      "title.lowercase_exactwords": {
        "query": "epler",
        "boost": 3
      }
    }
  }
}

```

### 2.3

```
# products with singular form "eple"

GET grocery-store/_search
{
  "query": {
    "match": {
      "title.norwegian": "epler"
    }
  }
}

```

### 2.4

```

# compound words

GET grocery-store/_search
{
  "query": {
    "match": {
      "title.compound_words": "epler"
    }
  }
}

```

## Ranking from 2.1 - 2.4

```
# With multi-match

GET grocery-store/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "prefix": {
            "title.keyword": {
              "value": "epler",
              "case_insensitive": true,
              "boost": 3
            }
          }
        },
        {
          "multi_match": {
            "query": "epler",
            "fields": [
              "title.lowercase_exactwords",
              "title.norwegian",
              "title.compound_words"
            ],
            "type": "best_fields"
          }
        }
      ]
    }
  }
}
```

```
### Without multi-match, more readable, maybe more expensive to run?

GET grocery-store/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "prefix": {
            "title.keyword": {
              "value": "epler",
              "case_insensitive": true,
              "boost": 10
            }
          }
        },
        {
          "match": {
            "title.lowercase_exactwords": {
              "query": "epler",
              "boost": 8
            }
          }
        },
        {
          "match": {
            "title.norwegian": {
              "query": "epler",
              "boost": 4
            }
          }
        },
        {
          "match": {
            "title.compound_words": {
              "query": "epler"
            }
          }
        }
      ]
    }
  }
}

```

## 3. Aggregation 📊

### 3

```

# Number of products per category

GET grocery-store/_search
{
  "size": 0,
  "aggs": {
    "total_products_per_category": {
      "terms": {
        "field": "category",
        "size": 10
      }
    }
  }
}

```

## 4. JavaScript app 👾

API is located at [/server](server)

### Install app 🐣

```
npm install
```

### Start app 🚀

Precondition:

- Create index and index data manually in Elastic cloud devtools using commands in part 1

### Use app 🍎

- Navigate to [http://localhost:3030/](http://localhost:3030/)

### Status 🚜

```
npm start
```

Done:

- Skeleton middleware available at localhost:3030/
- Outputs result of a query to console

Not done:

- Build UI to show search results
