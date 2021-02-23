"use strict";
const serverless = require("serverless-http");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

const middy = require("middy");
const axios = require("axios");

const { jsonBodyParser } = require("middy/middlewares");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.FILMS_TABLE;

const addFilm = async (event) => {
  try {
    const parameters = event.queryStringParameters;
    let { data } = await axios.get(
      `https://swapi.py4e.com/api/films/${parameters.id}/`
    );
    let item = {
      id: parameters.id,
      titulo: data.title,
      id_episodio: data.episode_id,
      rastreo_de_apertura: data.opening_crawl,
      director: data.director,
      productor: data.producer,
      fecha_lanzamiento: data.release_date,
      especies: data.species,
      naves: data.starships,
      vehiculos: data.vehicles,
      personajes: data.characters,
      planetas: data.planets,
      url: data.url,
      creado: data.created,
      editado: data.edited,
    };

    let result = await dynamoDB
      .put({
        TableName: tableName,
        Item: item,
      })
      .promise();

    console.log(item);

    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode ? error.statusCode : 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: error.name ? error.name : "Exception",
        message: error.message ? error.message : "Unknown error",
      }),
    };
  }
};

const handler = middy(addFilm).use(jsonBodyParser());

module.exports = { handler };
