document.addEventListener("DOMContentLoaded", () => {

  const API_KEY = "9787794794dd40908ea6c5c4ffae5cb9";
  const BASE_URL = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=20`;

  const container = document.getElementById("game-container");
  const searchInput = document.getElementById("search-input");
  const genreFilter = document.getElementById("genre-filter");
  const platformFilter = document.getElementById("platform-filter");
  const sortOption = document.getElementById("sort-option");
  const themeToggle = document.getElementById("theme-toggle");

  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  const closeModal = document.getElementById("close-modal");

  let allGames = [];
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  async function fetchGames() {
    showLoading();

    try {
      const response = await fetch(BASE_URL);
      const data = await response.json();

      allGames = data.results;
      displayGames(allGames);

    } catch (error) {
      showError();
      console.error(error);
    }
  }

  function displayGames(games) {
    container.innerHTML = "";

    games.map(game => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${game.background_image || ''}">
        <h3>${game.name}</h3>
        <p>⭐ ${game.rating}</p>

        <button onclick="toggleFavorite(${game.id})">
          ${favorites.includes(game.id) ? "❤️" : "🤍"}
        </button>

        <button onclick="showDetails(${game.id})">
          View Details
        </button>
      `;

      container.appendChild(card);
    });
  }

  function showLoading() {
    container.innerHTML = "<p>Loading...</p>";
  }

  function showError() {
    container.innerHTML = "<p>Failed to load data</p>";
  }

  function applyFilters() {
    let filtered = allGames;

    const searchText = searchInput.value.toLowerCase();
    const genre = genreFilter.value;
    const platform = platformFilter.value;

    filtered = filtered.filter(game =>
      game.name.toLowerCase().includes(searchText)
    );

    if (genre) {
      filtered = filtered.filter(game =>
        game.genres.some(g =>
          g.name.toLowerCase() === genre
        )
      );
    }

    if (platform) {
      filtered = filtered.filter(game =>
        game.platforms.some(p =>
          p.platform.name.toLowerCase().includes(platform)
        )
      );
    }

    if (sortOption.value === "rating") {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    }

    if (sortOption.value === "name") {
      filtered = filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    displayGames(filtered);
  }

  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter(fav => fav !== id);
    } else {
      favorites.push(id);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    applyFilters();
  }

  function showDetails(id) {
    const game = allGames.find(g => g.id === id);

    modalBody.innerHTML = `
      <h2>${game.name}</h2>
      <img src="${game.background_image}" width="100%">
      <p>⭐ Rating: ${game.rating}</p>
      <p><strong>Genres:</strong> ${game.genres.map(g => g.name).join(", ")}</p>
      <p><strong>Platforms:</strong> ${game.platforms.map(p => p.platform.name).join(", ")}</p>
    `;

    modal.classList.remove("hidden");
  }

  window.toggleFavorite = toggleFavorite;
  window.showDetails = showDetails;

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark);
  });

  if (localStorage.getItem("theme") === "true") {
    document.body.classList.add("dark-mode");
  }

  searchInput.addEventListener("input", applyFilters);
  genreFilter.addEventListener("change", applyFilters);
  platformFilter.addEventListener("change", applyFilters);
  sortOption.addEventListener("change", applyFilters);

  fetchGames();

});