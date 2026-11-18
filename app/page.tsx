"use client";

import { useEffect, useMemo, useState } from "react";
import {
  geoEqualEarth,
  geoPath,
  geoNaturalEarth1
} from "d3-geo";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";

type Country = {
  id: string;
  name: string;
  population: number;
  economy: number;
};

const countryNames: Record<string, string> = {
  "4": "Afghanistan",
  "8": "Albania",
  "12": "Algeria",
  "24": "Angola",
  "32": "Argentina",
  "36": "Australia",
  "40": "Austria",
  "50": "Bangladesh",
  "56": "Belgium",
  "76": "Brazil",
  "124": "Canada",
  "156": "China",
  "170": "Colombia",
  "180": "DR Congo",
  "203": "Czechia",
  "208": "Denmark",
  "818": "Egypt",
  "231": "Ethiopia",
  "246": "Finland",
  "250": "France",
  "276": "Germany",
  "288": "Ghana",
  "300": "Greece",
  "356": "India",
  "360": "Indonesia",
  "364": "Iran",
  "368": "Iraq",
  "376": "Israel",
  "380": "Italy",
  "392": "Japan",
  "400": "Jordan",
  "398": "Kazakhstan",
  "404": "Kenya",
  "410": "South Korea",
  "414": "Kuwait",
  "422": "Lebanon",
  "434": "Libya",
  "458": "Malaysia",
  "484": "Mexico",
  "504": "Morocco",
  "566": "Nigeria",
  "578": "Norway",
  "586": "Pakistan",
  "604": "Peru",
  "608": "Philippines",
  "616": "Poland",
  "620": "Portugal",
  "643": "Russia",
  "682": "Saudi Arabia",
  "710": "South Africa",
  "724": "Spain",
  "752": "Sweden",
  "756": "Switzerland",
  "760": "Syria",
  "764": "Thailand",
  "792": "Turkey",
  "804": "Ukraine",
  "784": "United Arab Emirates",
  "826": "United Kingdom",
  "840": "United States",
  "704": "Vietnam"
};

const countries = Object.entries(countryNames).map(
  ([id, name], index) => ({
    id,
    name,
    population: 5 + ((index * 17) % 140),
    economy: 50 + ((index * 31) % 900)
  })
);

const world = feature(
  worldData as never,
  (worldData as any).objects.countries
) as any;

const projection = geoNaturalEarth1()
  .fitSize([1000, 520], world);

const pathGenerator = geoPath(projection);

export default function Home() {
  const [selected, setSelected] = useState("840");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState(false);
  const [day, setDay] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [events, setEvents] = useState<string[]>([
    "World simulation initialized",
    "Sandbox mode activated"
  ]);

  const selectedCountry = countries.find(
    country => country.id === selected
  )!;

  const filteredCountries = useMemo(
    () =>
      countries.filter(country =>
        country.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      setDay(current => current + speed);
    }, 1500);

    return () => clearInterval(timer);
  }, [playing, speed]);

  function advanceDay() {
    setDay(current => current + 1);
    setEvents(current => [
      `Simulation advanced to day ${day + 1}`,
      ...current
    ].slice(0, 8));
  }

  function selectCountry(id: string) {
    setSelected(id);
    const country = countries.find(item => item.id === id);
    if (country) {
      setEvents(current => [
        `Selected ${country.name}`,
        ...current
      ].slice(0, 8));
    }
  }
    return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">W</div>
          <div>
            <div className="brand-name">
              WORLD SIMULATION
            </div>
            <div className="brand-subtitle">
              GLOBAL SANDBOX EXPERIENCE
            </div>
          </div>
        </div>

        <div className="status-pill">
          ● SANDBOX MODE
        </div>
      </header>

      <section className="dashboard">
        <div className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                WORLD MAP
              </div>
              <div className="panel-subtitle">
                Select a country to inspect it
              </div>
            </div>

            <div className="map-legend">
              <span className="legend-dot" />
              Selected country
            </div>
          </div>

          <div className="map-area">
            <svg
              className="world-map"
              viewBox="0 0 1000 520"
              role="img"
              aria-label="Interactive world map"
            >
              {world.features.map((country: any) => {
                const id = String(country.id);

                return (
                  <path
                    key={id}
                    d={pathGenerator(country) || ""}
                    className={
                      `country-shape ${
                        selected === id ? "selected" : ""
                      }`
                    }
                    onClick={() => {
                      if (countryNames[id]) {
                        selectCountry(id);
                      }
                    }}
                  />
                );
              })}
            </svg>
          </div>

          <div className="controls">
            <button
              className="game-button primary"
              onClick={() => setPlaying(!playing)}
            >
              {playing ? "Ⅱ Pause" : "▶ Play"}
            </button>

            <button
              className="game-button"
              onClick={advanceDay}
            >
              +1 Day
            </button>

            <span className="panel-subtitle">
              Simulation speed
            </span>

            {[1, 2, 4].map(value => (
              <button
                key={value}
                className={`game-button ${
                  speed === value ? "primary" : ""
                }`}
                onClick={() => setSpeed(value)}
              >
                {value}x
              </button>
            ))}
          </div>
        </div>

        <aside className="sidebar">
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  COUNTRY OVERVIEW
                </div>
                <div className="panel-subtitle">
                  Selected nation
                </div>
              </div>
            </div>

            <div className="sidebar-content">
              <div className="country-code">
                COUNTRY ID: {selectedCountry.id}
              </div>

              <div className="country-name">
                {selectedCountry.name}
              </div>

              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-label">
                    Population
                  </div>
                  <div className="stat-value">
                    {selectedCountry.population}M
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">
                    Economy
                  </div>
                  <div className="stat-value">
                    ${selectedCountry.economy}B
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">
                    Simulation Day
                  </div>
                  <div className="stat-value">
                    {day}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">
                    Game Mode
                  </div>
                  <div className="stat-value">
                    Sandbox
                  </div>
                </div>
              </div>
            </div>
          </section>
                    <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  COUNTRY DIRECTORY
                </div>
                <div className="panel-subtitle">
                  Browse available countries
                </div>
              </div>
            </div>

            <div className="sidebar-content">
              <input
                className="search-input"
                placeholder="Search countries..."
                value={search}
                onChange={event => setSearch(event.target.value)}
              />

              <div className="country-list">
                {filteredCountries.map(country => (
                  <button
                    key={country.id}
                    className={`country-item ${
                      selected === country.id ? "active" : ""
                    }`}
                    onClick={() => selectCountry(country.id)}
                  >
                    <span>{country.name}</span>
                    <span>→</span>
                  </button>
                ))}

                {filteredCountries.length === 0 && (
                  <div className="panel-subtitle">
                    No countries found.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="timeline">
              <div className="timeline-title">
                WORLD CHRONICLE
              </div>

              {events.map((event, index) => (
                <div className="event" key={`${event}-${index}`}>
                  <strong>Day {day}</strong>
                  {event}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <footer className="footer">
        WORLD SIMULATION GAME · SANDBOX EDITION
        <br />
        Initial simulation values are illustrative, not live statistics.
      </footer>
    </main>
  );
}
