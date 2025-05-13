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

function showSkeletons() {
    searchResultList.innerHTML = "";
    for (let i = 0; i < 6; i++) { // Show 6 skeleton cards
        const skeleton = document.createElement("div");
        skeleton.classList.add("skeleton-item");
        skeleton.classList.add("skeleton");
        searchResultList.appendChild(skeleton);
    }
}
function showToast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => toast.classList.remove("show"), 3000);
    setTimeout(() => toast.remove(), 3500);
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

    showSkeletons();
    const data = await getMoviesData(inpVal);
    showSearchResults(searchResultList, data);
}

function handleMovieDesc(listContainer, movieItem, posterCont, title, year) {
    const overlay = document.getElementById("movieOverlay");
    const overlayContent = document.getElementById("overlayMovieContent");
    const closeBtn = document.getElementById("closeOverlay");

    // Clear previous content
    overlayContent.innerHTML = "";

    // Poster image
    const img = document.createElement("img");
    img.src = movieItem.poster_path
        ? `https://image.tmdb.org/t/p/w500${movieItem.poster_path}`
        : "logo.svg";
    img.style.width = "180px";
    img.style.borderRadius = "12px";
    img.style.objectFit = "cover";

<<<<<<< HEAD
    // Title and year
    const titleElem = document.createElement("h2");
    titleElem.textContent = movieItem.original_title;
=======
    // Create favorite and favorited icons
    const favoriteLogo = document.createElement("img");
    favoriteLogo.src = "favorite_logo.svg";
    // Wrap both logos in a container
    const logos = document.createElement("div");
    logos.appendChild(favoriteLogo);
    logos.appendChild(favoritedLogo);
>>>>>>> c5fb5f65be84c8ce65ebde52ccfb25c511852651

    const yearElem = document.createElement("p");
    yearElem.textContent = `Year: ${movieItem.release_date.slice(0, 4)}`;

    // Overview
    const overview = document.createElement("p");
    overview.textContent = movieItem.overview;
    overview.style.marginTop = "1rem";

    // Favorite button
    const favoriteBtn = document.createElement("button");
    favoriteBtn.textContent = "Add to Favorites";
    favoriteBtn.classList.add("fav-btn");
    favoriteBtn.addEventListener("click", () => {
        handleAddToFavorite(movieItem.id);
        favoriteBtn.textContent = "Favorited";
        favoriteBtn.disabled = true;
    });

    // Append elements
    overlayContent.appendChild(img);
    overlayContent.appendChild(titleElem);
    overlayContent.appendChild(yearElem);
    overlayContent.appendChild(overview);
    overlayContent.appendChild(favoriteBtn);

    // Show overlay
    overlay.classList.add("show");

    // Close overlay
    closeBtn.onclick = () => overlay.classList.remove("show");
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") overlay.classList.remove("show");
    });
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
            poster.src = "logo.svg";
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
            Authorization: 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({ media_type: 'movie', media_id: parseInt(movieID), favorite: true })
    };
    displayLoader();
    const response = await fetch(url, options);
    const data = await response.json();
    hideLoader();

    if (data.success) {
        showToast("Movie added to Favorites!");
    }
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
    // displayLoader();
    showSkeletons();
    const data = await getFavorites();
    // hideLoader();
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
