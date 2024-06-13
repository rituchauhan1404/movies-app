//basic server setup
const express = require("express");
const { request, response } = require("http");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Movie = require("./models/movies");
const port = 3000;
const app = express();

// Database URI
const dbURI =
  "mongodb+srv://rituchauhansgnr:sAUHGhLM0o0o3E8K@comp1013cluster.vyrcnq7.mongodb.net/movie?retryWrites=true&w=majority&appName=Comp1013cluster";

// Set view engine and middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static("public"));

// Connect to MongoDB and start server
mongoose
  .connect(dbURI)
  .then((result) =>
    app.listen(port, () => {
      console.log(`Connected to DB\nListening on port ${port}`);
    })
  )
  .catch((error) => console.log(error));

// API to fetch all movies
app.get("/movies/api", async (request, response) => {
  const movie = await Movie.find();
  response.send(movie);
});

// Route to render movies index page
app.get("/movies", async (request, response) => {
  const movies = await Movie.find();
  const { sort } = request.query;

  //method to sort movies ascendingly by rating
  if (sort === "ascendingly") {
    movies.sort((a, b) => a.rating - b.rating);

    //method to sort movies descendingly by rating
  } else if (sort === "decendingly") {
    movies.sort((a, b) => b.rating - a.rating);
  }
  response.render("moviesIndex", { movies });
});

// Route to add a new movie
app.post("/movies", async (request, response) => {
  const { title, year, poster, rating, director, cast } = request.body;
  const newMovie = new Movie({
    title,
    year,
    poster,
    rating,
    director,
    cast,
  });
  await newMovie
    .save()
    .then((result) => response.redirect("/movies"))
    .catch((error) => console.log(error));
});

// Route to render the form for adding a new movie
app.get("/movies/new", (request, response) => {
  response.render("moviesNew");
});

// Route to update a movie
app.patch("/movies/:id", async (request, response) => {
  const { id } = request.params;
  const updates = request.body;
  await Movie.findByIdAndUpdate(id, updates)
    .then((result) => response.redirect("/movies"))
    .catch((error) => console.log(error));
});

// Route to render the form for editing a movie
app.get("/movies/:id/edit", async (request, response) => {
  const { id } = request.params;
  await Movie.findById(id)
    .then((result) => response.render("moviesEdit", { editMovie: result }))
    .catch((error) => console.log(error));
});

// Route to delete a movie
app.delete("/movies/:id", async (request, response) => {
  const { id } = request.params;
  await Movie.findByIdAndDelete(id)
    .then((result) => response.redirect("/movies"))
    .catch((error) => console.log(error));
});

// Route to view details of a movie
app.get("/movies/:id/view", (request, response) => {
  const { id } = request.params;

  Movie.findById(id)
    .then((movie) => {
      response.render("movieView", { movie });
    })
    .catch((error) => {
      console.log(error);
    });
});

// 404 Error handling
app.get("*", async (request, response) => {
  response.send("Page not found").status(404);
});
