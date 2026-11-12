const API_KEY = "7d5488e7";

const watchlistContainer =
    document.getElementById("watchlistContainer");

const recommendationContainer =
    document.getElementById("recommendationContainer");

const movieCount =
    document.getElementById("movieCount");

const totalRuntime =
    document.getElementById("totalRuntime");

const averageRuntime =
    document.getElementById("averageRuntime");

const backBtn =
    document.getElementById("backBtn");


// Candidate movies used by the recommendation system
const candidateMovies = [
    "Mad Max: Fury Road",
    "The Matrix",
    "Gladiator",
    "Avengers: Endgame",
    "The Hangover",
    "Mean Girls",
    "The Notebook",
    "La La Land",
    "The Exorcist",
    "A Quiet Place",
    "Get Out",
    "Alien",
    "Jurassic Park",
    "Inception",
    "The Prestige",
    "Forrest Gump"
];

// Retrieve movie information using IMDb ID
async function getMovie(imdbID) {

    const url =
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${encodeURIComponent(imdbID)}&plot=short`;

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

// Retrieve movie information using title
async function getMovieByTitle(title) {

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

// READ: Retrieve saved movies from Local Storage
function getWatchlist() {
    const movies = [];

    for (let i = 0; i < localStorage.length; i++) {

        const key = localStorage.key(i);

        if (key && key.startsWith("watchlist_")) {

            try {

                const movie = JSON.parse(
                    localStorage.getItem(key)
                );

                if (movie && movie.imdbID) {
                    movies.push(movie);
                }

            } catch (error) {

                console.error("Invalid saved movie:", error);

            }
        }
    }
    return movies;
}

// UPDATE: Change the watch status of a movie
function updateMovieStatus(imdbID, newStatus) {

    const key = `watchlist_${imdbID}`;

    const savedMovie = localStorage.getItem(key);

    if (!savedMovie) {
        alert("Movie not found in your watchlist.");
        return;
    }

    try {

        const movie = JSON.parse(savedMovie);

        movie.watchStatus = newStatus;

        localStorage.setItem(key, JSON.stringify(movie));

        alert("Movie status updated successfully!");

        loadWatchlist();

    } catch (error) {

        console.error(error);

        alert("Unable to update movie status.");

    }

}

// DELETE: Remove a movie from Local Storage
function removeFromWatchlist(imdbID) {

    const key = `watchlist_${imdbID}`;

    if (!localStorage.getItem(key)) {
        alert("Movie is not in your watchlist.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to remove this movie?"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(key);

    alert("Movie removed successfully!");

    loadWatchlist();

}

// Create a movie card
function createMovieCard(movie, showControls = false) {

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

    info.append(title, year, genre);

    // Display movie runtime
    if (movie.Runtime && movie.Runtime !== "N/A") {

        const runtime = document.createElement("p");

        runtime.textContent = `Runtime: ${movie.Runtime}`;

        info.appendChild(runtime);
    }

    // Show description when available
    if (movie.Plot && movie.Plot !== "N/A") {

        const plot = document.createElement("p");

        plot.className = "plot";

        plot.textContent = movie.Plot;

        info.appendChild(plot);
    }

    // Show controls for saved movies
    if (showControls) {

        const statusLabel = document.createElement("label");

        statusLabel.textContent = "Watch Status:";


        const statusSelect = document.createElement("select");

        statusSelect.className = "status-select";

        const statuses = [
            "Plan to Watch",
            "Watching",
            "Completed"
        ];

        const currentStatus =
            movie.watchStatus || "Plan to Watch";


        statuses.forEach(status => {

            const option = document.createElement("option");

            option.value = status;

            option.textContent = status;

            if (status === currentStatus) {
                option.selected = true;
            }

            statusSelect.appendChild(option);
        });

        const updateButton = document.createElement("button");

        updateButton.className = "update-btn";

        updateButton.textContent = "Update Status";

        updateButton.addEventListener("click", () => {
            updateMovieStatus(
                movie.imdbID,
                statusSelect.value
            );
        });

        const removeButton = document.createElement("button");

        removeButton.className = "remove-btn";

        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {

            removeFromWatchlist(movie.imdbID);

        });
        info.append(
            statusLabel,
            statusSelect,
            updateButton,
            removeButton
        );
    }
    card.append(poster, info);
    return card;
}

// Convert a runtime such as "152 min" into minutes
function convertRuntimeToMinutes(runtime) {

    if (!runtime || runtime === "N/A") {
        return null;
    }

    const match = runtime.match(/^(\d+)\s*min$/i);

    if (!match) {
        return null;
    }
    return Number(match[1]);
}

// CALCULATION: Calculate watchlist statistics
function calculateStatistics(movies) {
    let totalMinutes = 0;
    let validRuntimeCount = 0;

    movies.forEach(movie => {

        const minutes =
            convertRuntimeToMinutes(movie.Runtime);

        if (minutes !== null) {

            totalMinutes += minutes;

            validRuntimeCount++;
        }
    });

    const averageMinutes =
        validRuntimeCount > 0
            ? Math.round(totalMinutes / validRuntimeCount)
            : 0;

    // Display total movie count
    movieCount.textContent = movies.length;

    // Display total watch time
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    totalRuntime.textContent =
        `${totalMinutes} minutes (${hours}h ${minutes}m)`;

    // Display average runtime
    averageRuntime.textContent =
        `${averageMinutes} minutes`;

    // Show how many movies had valid runtime data
    if (validRuntimeCount < movies.length) {
        const note = document.createElement("p");

        note.textContent =
            `Runtime available for ${validRuntimeCount} of ${movies.length} movies.`;

        totalRuntime.parentElement.appendChild(note);
    }
}

// Display the saved movies
async function loadWatchlist() {

    watchlistContainer.textContent =
        "Loading your watchlist...";

    recommendationContainer.textContent =
        "Loading recommendations...";

    const savedMovies = getWatchlist();

    if (savedMovies.length === 0) {
        watchlistContainer.textContent =
            "Your watchlist is empty. Add movies from the discovery page!";
        recommendationContainer.textContent =
            "Add movies to your watchlist to receive recommendations.";
        movieCount.textContent = "0";
        totalRuntime.textContent = "0 minutes";
        averageRuntime.textContent = "0 minutes";
        return;
    }

    watchlistContainer.replaceChildren();

    const movies = [];

    // Retrieve current movie information from OMDb
    for (const savedMovie of savedMovies) {
        try {
            const movie = await getMovie(savedMovie.imdbID);

            // Preserve the user's locally saved status
            movie.watchStatus =
                savedMovie.watchStatus || "Plan to Watch";

            movies.push(movie);
        } catch (error) {
            console.error(
                `Unable to retrieve ${savedMovie.Title}:`,
                error
            );

            // Use saved information if the API is unavailable
            movies.push(savedMovie);
        }
    }

    watchlistContainer.replaceChildren();

    movies.forEach(movie => {
        const card = createMovieCard(movie, true);

        watchlistContainer.appendChild(card);
    });

    // Calculate watchlist statistics
    calculateStatistics(movies);

    // Generate recommendations
    await loadRecommendations(movies);
}

// RECOMMENDATION LOGIC
async function loadRecommendations(savedMovies) {
    recommendationContainer.textContent =
        "Finding suitable movies...";

    // Collect genres from saved movies
    const savedGenres = new Set();

    savedMovies.forEach(movie => {
        if (movie.Genre && movie.Genre !== "N/A") {
            movie.Genre.split(",").forEach(genre => {
                savedGenres.add(
                    genre.trim().toLowerCase()
                );
            });
        }
    });

    const savedIDs = new Set(
        savedMovies.map(movie => movie.imdbID)
    );

    const recommendations = [];

    // Retrieve candidate movies from OMDb
    for (const title of candidateMovies) {
        try {
            const movie = await getMovieByTitle(title);

            // Exclude movies already in the watchlist
            if (savedIDs.has(movie.imdbID)) {
                continue;
            }

            const genres = (movie.Genre || "")
                .split(",")
                .map(genre => genre.trim().toLowerCase())
                .filter(Boolean);
            // Count matching genres
            const matchingGenres = genres.filter(
                genre => savedGenres.has(genre)
            );

            // Recommend movies with at least one matching genre
            if (matchingGenres.length > 0) {
                recommendations.push({

                    ...movie,

                    matchingGenreCount: matchingGenres.length
                });
            }
        } catch (error) {
            console.error(
                `Unable to check recommendation ${title}:`,
                error
            );
        }
    }

    // Rank movies with more matching genres first
    recommendations.sort(
        (a, b) =>
            b.matchingGenreCount - a.matchingGenreCount
    );

    // Display up to six recommendations
    const selectedRecommendations =
        recommendations.slice(0, 6);


    // Save recommendations in Local Storage
    localStorage.setItem(
        "movieRecommendations",
        JSON.stringify(selectedRecommendations)
    );

    recommendationContainer.replaceChildren();

    if (selectedRecommendations.length === 0) {
        recommendationContainer.textContent =
            "No suitable recommendations found. Try adding more movies to your watchlist.";
        return;
    }


    selectedRecommendations.forEach(movie => {
        const card = createMovieCard(movie, false);
        const info = card.querySelector(".movie-info");
        const matchMessage = document.createElement("p");

        matchMessage.textContent =
            `Matching genres: ${movie.matchingGenreCount}`;
        info.appendChild(matchMessage);
        recommendationContainer.appendChild(card);
    });
}

// Navigate back to the discovery page
backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});

// Load the watchlist when the page opens
loadWatchlist();