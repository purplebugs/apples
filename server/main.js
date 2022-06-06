"use strict";

const dotenv = require("dotenv").config();

// initialise server
const express = require("express");
const port = 3030;

const { Client } = require("@elastic/elasticsearch");
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// app.use("/", express.static("static"));

// respond with friendly message when a GET request is made to the homepage
app.get("/", (req, res) => {
  res.send("🍎 I love apples!");
});

async function run() {
  // Let's search!
  const result = await client.search({
    index: "grocery-store",
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
