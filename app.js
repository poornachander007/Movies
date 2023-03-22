const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started and running at.. http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DataBase Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieObject = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};
const GetConvertedMovieName = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};
const convertDirectorObject = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

//  Get All Movies Names API
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT movie_name FROM movie`;
  const moviesArray = await db.all(getAllMoviesQuery);
  //   let convertedMoviesArray = moviesArray.map(convertMovieObject);
  let convertedMoviesArray = [];
  for (let obj of moviesArray) {
    convertedMoviesArray.push(GetConvertedMovieName(obj));
  }

  response.send(convertedMoviesArray);
});

// Get Movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie where movie_id = '${movieId}'`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieObject(movie));
});

// Add Movie API
app.post("/movies/", async (request, response) => {
  const movieDetailse = request.body;
  const { directorId, movieName, leadActor } = movieDetailse;
  const addMovieQuery = `INSERT INTO 
                            movie (director_id,movie_name,lead_actor) 
                            values ('${directorId}','${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// Update Movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetailse = request.body;
  const { directorId, movieName, leadActor } = movieDetailse;
  const UpdateMovieQuery = `Update movie SET director_id = '${directorId}',
                                        movie_name = '${movieName}',
                                        lead_actor = '${leadActor}'
                                        WHERE movie_id='${movieId}';`;
  const dbResponse = await db.run(UpdateMovieQuery);
  response.send("Movie Details Updated");
});

// Delete Movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const DeleteMovieQuery = `Delete from movie where movie_id = '${movieId}';`;
  const dbResponse = await db.run(DeleteMovieQuery);
  response.send("Movie Removed");
});

// Get All Directors API
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `SELECT * FROM director`;
  const directorsArray = await db.all(getAllDirectorsQuery);
  const convertedDirectorsArray = directorsArray.map(convertDirectorObject);
  response.send(convertedDirectorsArray);
});

// Get All Movies by Director API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieQuery = `SELECT * FROM movie where director_id = ${directorId}`;
  const getMoviesOfDirectorArray = await db.all(getMovieQuery);
  const convertedMoviesArray = getMoviesOfDirectorArray.map(
    GetConvertedMovieName
  );
  response.send(convertedMoviesArray);
});

module.exports = app;
