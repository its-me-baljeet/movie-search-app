// Global state to track favorited movies
const favoritesState = new Set();

const main = document.querySelector("main");
const searchSec = document.querySelector(".search-section");
const searchSelectBtn = document.querySelector(".select-search");
const favoritesSelectBtn = document.querySelector(".select-favorites");
const favoritesSec = document.querySelector(".favorites-section");
const inpCont = document.getElementById("search-inp");
const searchBtn = document.getElementById("search-btn");
const searchResultList = document.querySelector(".search-results-list");
const greetingSection = document.querySelector(".greeting");
const favoritesList = document.querySelector(".favorites-list");
const movieError = document.querySelector(".movie-error");

// View switching
function displayLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

searchSelectBtn.addEventListener("click", () => {
    inpCont.value = "";
    searchSec.style.display = "flex";
    favoritesSec.style.display = "none";
    document.querySelectorAll(".movie-card").forEach(card => card.remove());
});
favoritesSelectBtn.addEventListener("click", () => {
    searchSec.style.display = "none";
    favoritesSec.style.display = "flex";
    document.querySelectorAll(".movie-card").forEach(card => card.remove());
});
searchSelectBtn.click();

async function getMoviesData(movie) {
    try {
        const url = `https://api.themoviedb.org/3/search/movie?query=${movie}&include_adult=false&language=en-US&page=1`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDIxYWYyZTZjZWY0MTkwY2E1ZTkxZDUzYTE5MmQxZSIsIm5iZiI6MTc0MjgxNDU1MC4xOTcsInN1YiI6IjY3ZTEzZDU2NGNlMDdkNjg0ZTA4MDdmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.c5qp6Oy058By2odjQ2hnHhxXB6XSYcoi7O5hDlrwZdM'
            }
        };
        displayLoader();
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch {
        return "Movie not Found";
    }
    finally {
        hideLoader();
    }
}

async function handleSearch() {
    const inpVal = inpCont.value;
    searchResultList.style.display = "grid";
    main.style.transform = "translateY(0vh)";
    main.style.transition = "0.15s ease-in-out";
    greetingSection.style.display = "none";
    const data = await getMoviesData(inpVal);
    showSearchResults(searchResultList, data);
}

function handleMovieDesc(listContainer, movieItem, posterCont, title, year) {
    // Hide the list container when showing details
    listContainer.style.display = "none";

    const card = document.createElement("section");
    card.classList.add("movie-card");

    const imgCont = document.createElement("div");
    const descCont = document.createElement("div");
    descCont.classList.add("desc-cont");
    const descTopCont = document.createElement("div");
    descTopCont.classList.add("desc-top-cont");

    // Create favorite and favorited icons
    const favoriteLogo = document.createElement("img");
    favoriteLogo.src = "favorite_logo.svg";
    // Wrap both logos in a container
    const logos = document.createElement("div");
    logos.appendChild(favoriteLogo);
    logos.appendChild(favoritedLogo);

    // Set initial state based on favoritesState
    if (favoritesState.has(movieItem.id)) {
        favoriteLogo.style.display = "none";
        favoritedLogo.style.display = "block";
    } else {
        favoriteLogo.style.display = "block";
        favoritedLogo.style.display = "none";
    }

    // When favorite is clicked, add to favorites and update UI state
    favoriteLogo.addEventListener("click", () => {
        handleAddToFavorite(movieItem.id);
        favoriteLogo.style.display = "none";
        favoritedLogo.style.display = "block";
    });

    descTopCont.appendChild(title);
    descTopCont.appendChild(logos);

    // Adjust poster container position if needed
    posterCont.style.transform = "translateY(1vh)";
    imgCont.appendChild(posterCont);
    imgCont.style.transform = "translateY(-8vh)";

    // Build description section with overview and year
    const movieOverview = document.createElement("p");
    movieOverview.classList.add("movie-overview");
    movieOverview.textContent = movieItem.overview;
    descCont.appendChild(descTopCont);
    descCont.appendChild(movieOverview);
    descCont.appendChild(year);

    card.appendChild(imgCont);
    card.appendChild(descCont);
    main.appendChild(card);
}

function showSearchResults(listContainer, data) {
    listContainer.innerHTML = "";
    listContainer.style.display = "grid";
    document.querySelectorAll(".movie-card").forEach(card => card.remove());
    movieError.style.display = "none";
    if (data.results.length == 0) {
        movieError.style.display = "block";
    }
    data.results.forEach(movieItem => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-item");
        listItem.style.backgroundColor = "#22222b";
        listItem.style.position = "relative";

        const posterCont = document.createElement("div");
        posterCont.style.width = "180px";
        posterCont.style.aspectRatio = "2/3";
        posterCont.style.borderRadius = "10px";
        posterCont.style.overflow = "hidden";
        posterCont.style.transform = "translateY(-8vh)";
        listItem.style.marginTop = "10vh";

        // Create image element for poster
        const poster = document.createElement("img");
        poster.style.width = "100%";
        poster.style.height = "100%";
        poster.style.objectFit = "cover";

        const title = document.createElement("h1");
        const year = document.createElement("p");

        if (movieItem.poster_path) {
            poster.src = `https://image.tmdb.org/t/p/w500${movieItem.poster_path}`;
        } else {
            poster.alt = "No image available";
        }
        title.innerText = movieItem.original_title;
        year.innerText = movieItem.release_date.slice(0, 4);

        posterCont.appendChild(poster);
        listItem.appendChild(posterCont);
        listItem.appendChild(title);
        listItem.appendChild(year);

        // Clicking the list item shows the movie card details
        listItem.addEventListener("click", () => {
            handleMovieDesc(listContainer, movieItem, posterCont, title, year);
        });
        listContainer.appendChild(listItem);
    });
}

async function handleAddToFavorite(movieID) {
    console.log("Adding movie:", movieID);
    const url = 'https://api.themoviedb.org/3/account/21902211/favorite';
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDIxYWYyZTZjZWY0MTkwY2E1ZTkxZDUzYTE5MmQxZSIsIm5iZiI6MTc0MjgxNDU1MC4xOTcsInN1YiI6IjY3ZTEzZDU2NGNlMDdkNjg0ZTA4MDdmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.c5qp6Oy058By2odjQ2hnHhxXB6XSYcoi7O5hDlrwZdM'
        },
        body: JSON.stringify({ media_type: 'movie', media_id: parseInt(movieID), favorite: true })
    };
    displayLoader();
    const response = await fetch(url, options);
    const data = await response.json();
    hideLoader();
}

async function getFavorites() {
    const url = 'https://api.themoviedb.org/3/account/21902211/favorite/movies?language=en-US&page=1&sort_by=created_at.asc';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDIxYWYyZTZjZWY0MTkwY2E1ZTkxZDUzYTE5MmQxZSIsIm5iZiI6MTc0MjgxNDU1MC4xOTcsInN1YiI6IjY3ZTEzZDU2NGNlMDdkNjg0ZTA4MDdmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.c5qp6Oy058By2odjQ2hnHhxXB6XSYcoi7O5hDlrwZdM'
        }
    };
    displayLoader();
    const response = await fetch(url, options);
    const data = await response.json();
    hideLoader();
    return data;
}

async function handleDisplayFavorites() {
    displayLoader();
    const data = await getFavorites();
    hideLoader();
    showSearchResults(favoritesList, data);
}

inpCont.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        searchBtn.click();
    }
});
favoritesSelectBtn.addEventListener("click", () => handleDisplayFavorites());
searchBtn.addEventListener("click", () => handleSearch());
