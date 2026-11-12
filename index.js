const API_KEY = "7d5488e7";

const movieContainer = document.getElementById("movieContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const genreFilter = document.getElementById("genreFilter");
const watchlistBtn = document.getElementById("watchlistBtn");


// Sample movies for the genre filter
const sampleMovies = [
    "John Wick",
    "The Dark Knight",
    "The Conjuring",
    "Home Alone",
    "Titanic",
    "Interstellar"
];

let displayedMovies = [];


// Retrieve movie information from OMDb
async function getMovie(title) {

    const url =
        `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to connect to OMDb.");
    }

    const data = await response.json();

    if (data.Response !== "True") {
        throw new Error(data.Error || "Movie not found.");
    }

    return data;
}


// Display a movie card
function createMovieCard(movie) {

    const card = document.createElement("div");
    card.className = "movie-card";

    const poster = document.createElement("img");

    poster.src =
        movie.Poster && movie.Poster !== "N/A"
            ? movie.Poster
            : "";

    poster.alt = movie.Title;

    poster.addEventListener("error", () => {
        poster.alt = "Poster unavailable";
        poster.removeAttribute("src");
    });

    const info = document.createElement("div");
    info.className = "movie-info";

    const title = document.createElement("h3");
    title.textContent = movie.Title;

    const year = document.createElement("p");
    year.textContent = `Year: ${movie.Year}`;

    const genre = document.createElement("p");
    genre.textContent = `Genre: ${movie.Genre || "Unknown"}`;

    const addButton = document.createElement("button");
    addButton.className = "add-btn";
    addButton.textContent = "Add to Watchlist";

    addButton.addEventListener("click", () => {
        addToWatchlist(movie);
    });

    info.append(title, year, genre, addButton);
    card.append(poster, info);

    return card;
}


// Add movie to Local Storage
function addToWatchlist(movie) {

    const key = `watchlist_${movie.imdbID}`;

    if (localStorage.getItem(key)) {
        alert("This movie is already in your watchlist.");
        return;
    }

    const savedMovie = {
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Genre: movie.Genre,
        Poster: movie.Poster,
        watchStatus: "Plan to Watch"
    };

    localStorage.setItem(key, JSON.stringify(savedMovie));

    alert(`${movie.Title} added to your watchlist!`);
}


// Display movies using the selected genre
function displayMovies(movies) {

    movieContainer.replaceChildren();

    const selectedGenre = genreFilter.value;

    const filteredMovies =
        selectedGenre === "All"
            ? movies
            : movies.filter(movie =>
                (movie.Genre || "")
                    .toLowerCase()
                    .includes(selectedGenre.toLowerCase())
            );

    if (filteredMovies.length === 0) {

        const message = document.createElement("p");
        message.textContent = "No movies found for this genre.";

        movieContainer.appendChild(message);
        return;
    }

    filteredMovies.forEach(movie => {
        movieContainer.appendChild(createMovieCard(movie));
    });
}


// Load sample movies from OMDb
async function loadMovies() {

    movieContainer.textContent = "Loading movies...";

    displayedMovies = [];

    try {

        for (const title of sampleMovies) {

            try {

                const movie = await getMovie(title);
                displayedMovies.push(movie);

            } catch (error) {

                console.error(`Unable to load ${title}:`, error);

            }
        }

        displayMovies(displayedMovies);

    } catch (error) {

        movieContainer.textContent =
            "Unable to load movies. Please check your connection and API key.";

    }
}


// Search for a movie
async function searchMovie() {

    const title = searchInput.value.trim();

    if (title === "") {
        alert("Please enter a movie title.");
        return;
    }

    movieContainer.textContent = "Searching for movie...";

    try {

        const movie = await getMovie(title);

        displayedMovies = [movie];

        displayMovies(displayedMovies);

    } catch (error) {

        movieContainer.replaceChildren();

        const message = document.createElement("p");

        message.textContent =
            error.message === "Movie not found."
                ? "Movie not found. Try another title."
                : "Unable to search for this movie. Check your API key and connection.";

        movieContainer.appendChild(message);

    }
}


// Search button
searchBtn.addEventListener("click", searchMovie);


// Search when Enter is pressed
searchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        searchMovie();
    }

});


// Genre filter
genreFilter.addEventListener("change", () => {
    displayMovies(displayedMovies);
});


// Navigate to watchlist
watchlistBtn.addEventListener("click", () => {

    window.location.href = "watchlist.html";

});


// Load movies when the page opens
loadMovies();