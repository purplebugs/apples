"use strict";

const dotenv = require("dotenv").config();

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
