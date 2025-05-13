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

function showSkeletons(container) {
    container.innerHTML = "";
    for (let i = 0; i < 6; i++) { // Show 6 skeleton cards
        const skeleton = document.createElement("div");
        skeleton.classList.add("skeleton-item");
        skeleton.classList.add("skeleton");
        container.appendChild(skeleton);
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
    searchResultList.innerHTML = ""; // Clear search results when switching views
    movieError.style.display = "none"; // Hide error message when switching views
});

favoritesSelectBtn.addEventListener("click", () => {
    searchSec.style.display = "none";
    favoritesSec.style.display = "flex";
    handleDisplayFavorites(); // Load favorites when switching to favorites view
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
    } catch (error) {
        console.error("Error fetching movie data:", error);
        return { results: [] }; // Return empty results array on error
    }
    finally {
        hideLoader();
    }
}

async function handleSearch() {
    const inpVal = inpCont.value.trim();
    if (!inpVal) {
        showToast("Please enter a movie title");
        return;
    }

    searchResultList.style.display = "grid";
    main.style.transform = "translateY(0vh)";
    main.style.transition = "0.15s ease-in-out";
    greetingSection.style.display = "none";

    showSkeletons(searchResultList);
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

    // Title and year
    const titleElem = document.createElement("h2");
    titleElem.textContent = movieItem.original_title;

    const yearElem = document.createElement("p");
    // Check if release_date exists before trying to slice it
    const releaseYear = movieItem.release_date ? movieItem.release_date.slice(0, 4) : "N/A";
    yearElem.textContent = `Year: ${releaseYear}`;

    // Overview
    const overview = document.createElement("p");
    overview.textContent = movieItem.overview || "No overview available";
    overview.style.marginTop = "1rem";

    // Check if we're in favorites view
    const isInFavorites = listContainer === favoritesList;

    // Button container for better styling
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "10px";
    buttonContainer.style.marginTop = "10px";

    if (isInFavorites) {
        // Remove from favorites button
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove from Favorites";
        removeBtn.classList.add("fav-btn");
        removeBtn.style.backgroundColor = "#ff4757"; // Red color for delete
        removeBtn.addEventListener("click", () => {
            handleRemoveFromFavorite(movieItem.id);
            removeBtn.textContent = "Removed";
            removeBtn.disabled = true;
            // Close overlay after a delay
            setTimeout(() => {
                overlay.classList.remove("show");
                handleDisplayFavorites(); // Refresh favorites list
            }, 1000);
        });
        buttonContainer.appendChild(removeBtn);
    } else {
        // Add to favorites button
        const favoriteBtn = document.createElement("button");
        favoriteBtn.textContent = "Add to Favorites";
        favoriteBtn.classList.add("fav-btn");
        favoriteBtn.addEventListener("click", () => {
            handleAddToFavorite(movieItem.id);
            favoriteBtn.textContent = "Favorited";
            favoriteBtn.disabled = true;
        });
        buttonContainer.appendChild(favoriteBtn);
    }

    // Append elements
    overlayContent.appendChild(img);
    overlayContent.appendChild(titleElem);
    overlayContent.appendChild(yearElem);
    overlayContent.appendChild(overview);
    overlayContent.appendChild(buttonContainer);

    // Show overlay
    overlay.classList.add("show");

    // Close overlay
    closeBtn.onclick = () => overlay.classList.remove("show");

    // Close with Escape key
    const escapeHandler = (e) => {
        if (e.key === "Escape") {
            overlay.classList.remove("show");
            window.removeEventListener("keydown", escapeHandler);
        }
    };
    window.addEventListener("keydown", escapeHandler);
}

function showSearchResults(listContainer, data) {
    listContainer.innerHTML = "";
    listContainer.style.display = "grid";
    movieError.style.display = "none";

    if (!data.results || data.results.length === 0) {
        movieError.style.display = "block";
        return;
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

        // Check if release_date exists before trying to slice it
        year.innerText = movieItem.release_date ? movieItem.release_date.slice(0, 4) : "N/A";

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

    try {
        displayLoader();
        const response = await fetch(url, options);
        const data = await response.json();

        if (data.success) {
            showToast("Movie added to Favorites!");
        } else {
            showToast("Failed to add to favorites");
        }
    } catch (error) {
        console.error("Error adding to favorites:", error);
        showToast("Error adding to favorites");
    } finally {
        hideLoader();
    }
}

async function handleRemoveFromFavorite(movieID) {
    console.log("Removing movie:", movieID);
    const url = 'https://api.themoviedb.org/3/account/21902211/favorite';
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZDIxYWYyZTZjZWY0MTkwY2E1ZTkxZDUzYTE5MmQxZSIsIm5iZiI6MTc0MjgxNDU1MC4xOTcsInN1YiI6IjY3ZTEzZDU2NGNlMDdkNjg0ZTA4MDdmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.c5qp6Oy058By2odjQ2hnHhxXB6XSYcoi7O5hDlrwZdM'
        },
        body: JSON.stringify({ media_type: 'movie', media_id: parseInt(movieID), favorite: false })
    };

    try {
        displayLoader();
        const response = await fetch(url, options);
        const data = await response.json();

        if (data.success) {
            showToast("Movie removed from Favorites!");
        } else {
            showToast("Failed to remove from favorites");
        }
    } catch (error) {
        console.error("Error removing from favorites:", error);
        showToast("Error removing from favorites");
    } finally {
        hideLoader();
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

    try {
        displayLoader();
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return { results: [] }; // Return empty results array on error
    } finally {
        hideLoader();
    }
}

async function handleDisplayFavorites() {
    showSkeletons(favoritesList);
    const data = await getFavorites();
    showSearchResults(favoritesList, data);
}

inpCont.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        searchBtn.click();
    }
});

searchBtn.addEventListener("click", () => handleSearch());