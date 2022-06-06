"use strict";

const dotenv = require("dotenv").config();
const express = require("express");
const { Client } = require("@elastic/elasticsearch");

const PORT = 3030;
const INDEX_NAME = "grocery-store";

const client = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID,
  },
  auth: {
    username: process.env.ELASTIC_AUTH_USERNAME,
    password: process.env.ELASTIC_AUTH_PASSWORD,
  },
});

// create an express app
const app = express();

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// app.use("/", express.static("static"));

// middleware that will be run on all incoming requests, and run before any matching routes further down
app.use((req, res, next) => {
  console.log("middleware request made", req.params);

  // Typically this is where you would add some logic to handle input before it is sent in,
  // eg change to lowercase, list the known categories

  // if (req.params.keyword === "anita") {
  //   next();
  // } else {
  //   next(new Error("forced error by anita"));
  // }

  // must call next() or the server will hang
  next();
});

// define routes using express.js

// respond with friendly message when a GET request is made to the homepage
app.get("/", (req, res) => {
  res.send("🍎 I love apples!");
});

// respond with HTML list of categories when a GET request is made to /categories
app.get("/api/list/categories", async (req, res) => {
  // Outgoing request (upstream) to Elasticsearch to return unique categories
  const result_uniqueCategories = await client.search({
    index: INDEX_NAME,
    body: {
      size: 0,
      aggs: {
        total_products_per_category: {
          terms: {
            field: "category",
          },
        },
      },
    },
  });

  console.log(
    "result_uniqueCategories",
    JSON.stringify(result_uniqueCategories, null, 2)
  );

  const arrayOfCategories =
    result_uniqueCategories.aggregations.total_products_per_category.buckets.map(
      (item) => {
        return `<li><a href="/api/categories/${item.key}">${item.key}</a></li>`;
      }
    );

  res.send(`<ul>${arrayOfCategories.join("")}</ul>`);
});

// Make use of the Elasticsearch client to return search results
async function run() {
  // Let's search!
  const result = await client.search({
    index: INDEX_NAME,
    query: {
      bool: {
        should: [
          {
            prefix: {
              "title.keyword": {
                value: "epler",
                case_insensitive: true,
                boost: 10,
              },
            },
          },
          {
            match: {
              "title.lowercase_exactwords": {
                query: "epler",
                boost: 8,
              },
            },
          },
          {
            match: {
              "title.norwegian": {
                query: "epler",
                boost: 4,
              },
            },
          },
          {
            match: {
              "title.compound_words": {
                query: "epler",
              },
            },
          },
        ],
      },
    },
  });

  console.log(result.hits.hits);
}

run().catch(console.log);
