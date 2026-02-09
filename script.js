const API_KEY = "2201a4b1a6fd7d3cf876d76c09f1e974";


function setThemeByTemp(temp) {
  const body = document.body;

  if (temp >= 30) {
    body.style.background =
      "radial-gradient(circle at top, #fb923c, #7c2d12)";
  } else if (temp <= 10) {
    body.style.background =
      "radial-gradient(circle at top, #38bdf8, #020617)";
  } else {
    body.style.background =
      "radial-gradient(circle at top, #6366f1, #020617)";
  }
}


let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

function saveToHistory(city) {
  history = [city, ...history.filter(c => c !== city)].slice(0, 5);
  localStorage.setItem("weatherHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  if (history.length === 0) {
    historyDiv.classList.add("hidden");
    return;
  }

  history.forEach(city => {
    const btn = document.createElement("button");
    btn.textContent = city;
    btn.onclick = () => selectCity(city);
    historyDiv.appendChild(btn);
  });

  historyDiv.classList.remove("hidden");
}

function selectCity(city) {
  document.getElementById("cityInput").value = city;
  suggestionsBox.classList.add("hidden");
  getWeather();
}

/* ===============================
   MAIN WEATHER FETCH
================================ */
async function getWeather() {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value.trim();
  const error = document.getElementById("error");
  const card = document.getElementById("weatherCard");

  error.textContent = "";
  card.classList.add("hidden");

  if (!city) {
    error.textContent = "Enter a city name";
    return;
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();

    const description = data.weather[0].description
      .split(" ")
      .map(w => w[0].toUpperCase() + w.slice(1))
      .join(" ");

    document.getElementById("city").textContent =
      `${data.name}, ${data.sys.country}`;
    document.getElementById("temp").textContent =
      Math.round(data.main.temp);
    document.getElementById("condition").textContent =
      `${description} | Feels like ${Math.round(data.main.feels_like)}°`;
    document.getElementById("humidity").textContent =
      data.main.humidity + "%";
    document.getElementById("wind").textContent =
      data.wind.speed + " m/s";

    document.getElementById("icon").src =
      `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    setThemeByTemp(data.main.temp);

    saveToHistory(`${data.name}, ${data.sys.country}`);

    card.classList.remove("hidden");

  } catch (err) {
    error.textContent = err.message;
  }
}

/* ===============================
   AUTOCOMPLETE SUGGESTIONS
================================ */
let typingTimer;
const input = document.getElementById("cityInput");
const suggestionsBox = document.getElementById("suggestions");

input.addEventListener("input", () => {
  clearTimeout(typingTimer);
  const query = input.value.trim();

  if (query.length < 2) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  typingTimer = setTimeout(() => fetchSuggestions(query), 400);
});

async function fetchSuggestions(query) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
    );
    const data = await res.json();

    if (!data.length) {
      suggestionsBox.classList.add("hidden");
      return;
    }

    suggestionsBox.innerHTML = "";

    data.forEach(c => {
      const div = document.createElement("div");
      const label = `${c.name}${c.state ? ", " + c.state : ""}, ${c.country}`;
      div.textContent = label;
      div.onclick = () => useSuggestion(label);
      suggestionsBox.appendChild(div);
    });

    suggestionsBox.classList.remove("hidden");
  } catch {
    suggestionsBox.classList.add("hidden");
  }
}

function useSuggestion(value) {
  input.value = value;
  suggestionsBox.classList.add("hidden");
  getWeather();
}

/* ===============================
   INITIAL LOAD
================================ */
renderHistory();
