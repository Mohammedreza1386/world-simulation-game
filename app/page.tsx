
"use client";

import { useEffect, useMemo, useState } from "react";
import { geoPath, geoNaturalEarth1 } from "d3-geo";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";

type Country = {
  id: string;
  name: string;
  population: number;
  economy: number;
  budget: number;
  stability: number;
  research: number;
  relations: number;
};

type Tab = "world" | "economy" | "diplomacy" | "research";

const countryNames: Record<string, string> = {
  "4":"Afghanistan","8":"Albania","12":"Algeria","24":"Angola",
  "32":"Argentina","36":"Australia","40":"Austria","50":"Bangladesh",
  "56":"Belgium","76":"Brazil","124":"Canada","156":"China",
  "170":"Colombia","180":"DR Congo","203":"Czechia","208":"Denmark",
  "818":"Egypt","231":"Ethiopia","246":"Finland","250":"France",
  "276":"Germany","288":"Ghana","300":"Greece","356":"India",
  "360":"Indonesia","364":"Iran","368":"Iraq","376":"Israel",
  "380":"Italy","392":"Japan","400":"Jordan","398":"Kazakhstan",
  "404":"Kenya","410":"South Korea","414":"Kuwait","422":"Lebanon",
  "434":"Libya","458":"Malaysia","484":"Mexico","504":"Morocco",
  "566":"Nigeria","578":"Norway","586":"Pakistan","604":"Peru",
  "608":"Philippines","616":"Poland","620":"Portugal","643":"Russia",
  "682":"Saudi Arabia","710":"South Africa","724":"Spain","752":"Sweden",
  "756":"Switzerland","760":"Syria","764":"Thailand","792":"Turkey",
  "804":"Ukraine","784":"United Arab Emirates","826":"United Kingdom",
  "840":"United States","704":"Vietnam"
};

const initialCountries: Country[] = Object.entries(countryNames).map(
  ([id, name], index) => ({
    id,
    name,
    population: 5 + ((index * 17) % 140),
    economy: 50 + ((index * 31) % 900),
    budget: 25 + ((index * 13) % 160),
    stability: 55 + ((index * 7) % 40),
    research: 10 + ((index * 11) % 75),
    relations: 40 + ((index * 9) % 55)
  })
);

const world = feature(
  worldData as never,
  (worldData as any).objects.countries
) as any;

const projection = geoNaturalEarth1().fitSize([1000, 520], world);
const pathGenerator = geoPath(projection);

const money = (value: number) =>
  value >= 1000
    ? `$${(value / 1000).toFixed(2)}T`
    : `$${value.toFixed(1)}B`;

export default function Home() {
  const [selected, setSelected] = useState("840");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState(false);
  const [day, setDay] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [tab, setTab] = useState<Tab>("world");

  const [nations, setNations] = useState<Record<string, Country>>(
    () => Object.fromEntries(
      initialCountries.map(country => [country.id, country])
    )
  );

  const [events, setEvents] = useState<string[]>([
    "Sandbox initialized. Your world is ready.",
    "Global simulation systems are online."
  ]);

  const [agreements, setAgreements] = useState<string[]>([]);
  const [researchFocus, setResearchFocus] = useState("Clean energy");

  const country = nations[selected];

  const filteredCountries = useMemo(
    () => Object.values(nations)
      .filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
    [nations, search]
  );

  function logEvent(message: string) {
    setEvents(current => [
      `Day ${day}: ${message}`,
      ...current
    ].slice(0, 12));
  }

  function advance(days = 1) {
    setDay(current => current + days);

    setNations(current =>
      Object.fromEntries(
        Object.entries(current).map(([id, item]) => {
          const growth = (Math.random() - 0.46) * 0.35;

          return [
            id,
            {
              ...item,
              economy: Math.max(
                10,
                Number(
                  (item.economy * (1 + growth / 100)).toFixed(1)
                )
              ),
              population: Number(
                (item.population * 1.00015).toFixed(2)
              ),
              stability: Math.max(
                20,
                Math.min(
                  99,
                  Number(
                    (item.stability + (Math.random() - 0.5) * 0.7)
                      .toFixed(1)
                  )
                )
              )
            }
          ];
        })
      )
    );

    setEvents(current => [
      `Day ${day + days}: The world moved forward.`,
      ...current
    ].slice(0, 12));
  }

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      advance(speed);
    }, 2200);

    return () => clearInterval(timer);
  }, [playing, speed]);

  function selectCountry(id: string) {
    if (!nations[id]) return;

    setSelected(id);
    setEvents(current => [
      `Day ${day}: Opened ${nations[id].name}.`,
      ...current
    ].slice(0, 12));
  }

  function applyPolicy(
    name: string,
    economyBoost: number,
    stabilityBoost: number
  ) {
    if (country.budget < 8) return;

    setNations(current => ({
      ...current,
      [selected]: {
        ...current[selected],
        economy: Number(
          (current[selected].economy + economyBoost).toFixed(1)
        ),
        budget: current[selected].budget - 8,
        stability: Math.min(
          99,
          current[selected].stability + stabilityBoost
        )
      }
    }));

    logEvent(`${country.name} launched ${name}.`);
  }

  function signAgreement(name: string) {
    const label = `${country.name} · ${name}`;

    if (agreements.includes(label)) return;

    setAgreements(current => [label, ...current]);

    setNations(current => ({
      ...current,
      [selected]: {
        ...current[selected],
        relations: Math.min(
          99,
          current[selected].relations + 5
        )
      }
    }));

    logEvent(`${country.name} signed ${name}.`);
  }

  function investResearch() {
    if (country.budget < 5 || country.research >= 100) return;

    setNations(current => ({
      ...current,
      [selected]: {
        ...current[selected],
        research: Math.min(
          100,
          current[selected].research + 8
        ),
        budget: current[selected].budget - 5
      }
    }));

    logEvent(`${country.name} invested in ${researchFocus}.`);
  }

  return (
    <main className="app-shell">

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">W</div>
          <div>
            <div className="brand-name">WORLD SIMULATION</div>
            <div className="brand-subtitle">
              BUILD A WORLD. SHAPE ITS FUTURE.
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <div className="day-pill">
            YEAR 1 · DAY {day}
          </div>
          <div className="status-pill">
            <i /> SANDBOX MODE
          </div>
        </div>
      </header>

      <section className="hero-strip">
        <div>
          <span className="eyebrow">YOUR WORLD, YOUR RULES</span>
          <h1>Global Sandbox</h1>
          <p>
            Lead nations, grow economies and shape a changing world.
          </p>
        </div>

        <div className="hero-stats">
          <div>
            <span>COUNTRIES</span>
            <strong>{Object.keys(nations).length}</strong>
          </div>
          <div>
            <span>WORLD DAY</span>
            <strong>{day}</strong>
          </div>
          <div>
            <span>AGREEMENTS</span>
            <strong>{agreements.length}</strong>
          </div>
        </div>
      </section>

      <nav className="main-nav">
        {([
          ["world", "◉", "World"],
          ["economy", "▤", "Economy"],
          ["diplomacy", "⇄", "Diplomacy"],
          ["research", "✧", "Research"]
        ] as [Tab, string, string][]).map(
          ([id, icon, label]) => (
            <button
              key={id}
              className={tab === id ? "nav-item active" : "nav-item"}
              onClick={() => setTab(id)}
            >
              <span>{icon}</span>
              {label}
            </button>
          )
        )}
      </nav>

      <section className="dashboard">

        <div className="main-column">

          <section className="panel map-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">WORLD MAP</div>
                <div className="panel-subtitle">
                  Select a country to manage it
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
                {world.features.map((item: any) => {
                  const id = String(item.id);

                  return (
                    <path
                      key={id}
                      d={pathGenerator(item) || ""}
                      className={`country-shape ${
                        selected === id ? "selected" : ""
                      } ${
                        countryNames[id] ? "available" : "unavailable"
                      }`}
                      onClick={() => selectCountry(id)}
                    />
                  );
                })}
              </svg>

              <div className="map-caption">
                <span className="live-dot" />
                SIMULATION ACTIVE · {country.name.toUpperCase()}
              </div>
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
                onClick={() => advance(1)}
              >
                +1 Day
              </button>

              <span className="panel-subtitle speed-label">
                Simulation speed
              </span>

              {[1, 2, 4].map(value => (
                <button
                  key={value}
                  className={`game-button speed-button ${
                    speed === value ? "primary" : ""
                  }`}
                  onClick={() => setSpeed(value)}
                >
                  {value}x
                </button>
              ))}
            </div>
          </section>

          {tab === "world" && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">COUNTRY OVERVIEW</div>
                  <div className="panel-subtitle">
                    National status and development
                  </div>
                </div>
                <span className="country-tag">ID {country.id}</span>
              </div>

              <div className="country-overview">
                <div className="country-heading">
                  <div>
                    <span className="eyebrow">SELECTED NATION</span>
                    <h2>{country.name}</h2>
                  </div>
                  <div className="stability-badge">
                    <span />
                    {country.stability}% stability
                  </div>
                </div>

                <div className="stat-grid">
                  <div className="stat-card">
                    <span>Population</span>
                    <strong>{country.population.toFixed(1)}M</strong>
                    <small>Illustrative simulation</small>
                  </div>
                  <div className="stat-card">
                    <span>Economy</span>
                    <strong>{money(country.economy)}</strong>
                    <small>Simulated GDP</small>
                  </div>
                  <div className="stat-card">
                    <span>National budget</span>
                    <strong>{money(country.budget)}</strong>
                    <small>Available funds</small>
                  </div>
                  <div className="stat-card">
                    <span>Research level</span>
                    <strong>{country.research}%</strong>
                    <small>Innovation progress</small>
                  </div>
                </div>

                <div className="progress-wrap">
                  <div className="progress-label">
                    <span>Stability index</span>
                    <strong>{country.stability}%</strong>
                  </div>
                  <div className="progress-track">
                    <i style={{ width: `${country.stability}%` }} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {tab === "economy" && (
            <section className="panel feature-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">
                    ECONOMY & DEVELOPMENT
                  </div>
                  <div className="panel-subtitle">
                    National policy center
                  </div>
                </div>
                <span className="country-tag">ECONOMY</span>
              </div>

              <div className="feature-content">
                <h2>Build a stronger economy</h2>
                <p>
                  Invest in development programs for {country.name}.
                  Each action uses part of the national budget.
                </p>

                <div className="policy-grid">
                  <button
                    className="policy-card"
                    disabled={country.budget < 8}
                    onClick={() =>
                      applyPolicy("Education & skills", 12, 2)
                    }
                  >
                    <span className="policy-icon">▤</span>
                    <strong>Education & skills</strong>
                    <small>Improve productivity and stability.</small>
                    <b>Cost: $8B</b>
                  </button>

                  <button
                    className="policy-card"
                    disabled={country.budget < 8}
                    onClick={() =>
                      applyPolicy("Green transition", 9, 3)
                    }
                  >
                    <span className="policy-icon">♧</span>
                    <strong>Green transition</strong>
                    <small>Support sustainable infrastructure.</small>
                    <b>Cost: $8B</b>
                  </button>

                  <button
                    className="policy-card"
                    disabled={country.budget < 8}
                    onClick={() =>
                      applyPolicy("Trade reform", 15, 1)
                    }
                  >
                    <span className="policy-icon">⇄</span>
                    <strong>Trade reform</strong>
                    <small>Improve trade and business activity.</small>
                    <b>Cost: $8B</b>
                  </button>

                  <button
                    className="policy-card"
                    disabled={country.budget < 8}
                    onClick={() =>
                      applyPolicy("Infrastructure", 11, 2)
                    }
                  >
                    <span className="policy-icon">⌂</span>
                    <strong>Infrastructure</strong>
                    <small>Upgrade transport and public services.</small>
                    <b>Cost: $8B</b>
                  </button>
                </div>
              </div>
            </section>
          )}

          {tab === "diplomacy" && (
            <section className="panel feature-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">DIPLOMACY CENTER</div>
                  <div className="panel-subtitle">
                    International relations
                  </div>
                </div>
                <span className="country-tag">DIPLOMACY</span>
              </div>

              <div className="feature-content">
                <h2>International relations</h2>
                <p>
                  Build peaceful partnerships for {country.name}.
                </p>

                <div className="relation-card">
                  <div>
                    <span className="eyebrow">RELATIONS INDEX</span>
                    <strong>{country.relations}/100</strong>
                  </div>
                  <div className="progress-track">
                    <i style={{ width: `${country.relations}%` }} />
                  </div>
                </div>

                <div className="action-row">
                  <button
                    className="action-card"
                    onClick={() => signAgreement("Trade agreement")}
                  >
                    <strong>⇄ Trade agreement</strong>
                    <span>Economic cooperation</span>
                  </button>

                  <button
                    className="action-card"
                    onClick={() => signAgreement("Research partnership")}
                  >
                    <strong>✧ Research partnership</strong>
                    <span>Scientific cooperation</span>
                  </button>

                  <button
                    className="action-card"
                    onClick={() => signAgreement("Cultural exchange")}
                  >
                    <strong>◇ Cultural exchange</strong>
                    <span>People-to-people ties</span>
                  </button>
                </div>

                <h3 className="subheading">Signed agreements</h3>

                {agreements.length > 0 ? (
                  <div className="agreement-list">
                    {agreements.map(item => (
                      <div key={item}>✓ {item}</div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    No agreements yet. Start your first initiative.
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === "research" && (
            <section className="panel feature-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">
                    RESEARCH & INNOVATION
                  </div>
                  <div className="panel-subtitle">
                    National research center
                  </div>
                </div>
                <span className="country-tag">SCIENCE</span>
              </div>

              <div className="feature-content">
                <h2>Shape the next era</h2>
                <p>
                  Invest in research to improve innovation in {country.name}.
                </p>

                <label className="select-label" htmlFor="research-focus">
                  Research focus
                </label>

                <select
                  id="research-focus"
                  className="search-input focus-select"
                  value={researchFocus}
                  onChange={event => setResearchFocus(event.target.value)}
                >
                  <option>Clean energy</option>
                  <option>Medicine</option>
                  <option>Artificial intelligence</option>
                  <option>Space science</option>
                  <option>Agriculture</option>
                </select>

                <div className="research-meter">
                  <div className
                                      <div className="progress-label">
                    <span>{researchFocus}</span>
                    <strong>{country.research}%</strong>
                  </div>
                  <div className="progress-track">
                    <i style={{ width: `${country.research}%` }} />
                  </div>
                </div>

                <button
                  className="game-button primary invest-button"
                  disabled={country.budget < 5 || country.research >= 100}
                  onClick={investResearch}
                >
                  ✧ Invest $5B in research
                </button>
              </div>
            </section>
          )}

        </div>

        <aside className="sidebar">

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">COUNTRY DIRECTORY</div>
                <div className="panel-subtitle">
                  Browse playable nations
                </div>
              </div>
              <span className="country-tag">
                {filteredCountries.length}
              </span>
            </div>

            <div className="sidebar-content">
              <input
                className="search-input"
                placeholder="Search countries..."
                value={search}
                onChange={event => setSearch(event.target.value)}
              />

              <div className="country-list">
                {filteredCountries.map(item => (
                  <button
                    key={item.id}
                    className={`country-item ${
                      selected === item.id ? "active" : ""
                    }`}
                    onClick={() => selectCountry(item.id)}
                  >
                    <span>{item.name}</span>
                    <span>{money(item.economy)} →</span>
                  </button>
                ))}

                {filteredCountries.length === 0 && (
                  <div className="empty-state">No countries found.</div>
                )}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="timeline">
              <div className="timeline-head">
                <div>
                  <div className="panel-title">WORLD CHRONICLE</div>
                  <div className="panel-subtitle">
                    Latest simulation events
                  </div>
                </div>
                <span className="live-dot" />
              </div>

              {events.map((event, index) => (
                <div className="event" key={`${event}-${index}`}>
                  <span className="event-node" />
                  <div>{event}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel quick-panel">
            <div className="panel-title">WORLD STATUS</div>
            <div className="quick-row">
              <span>Simulation</span>
              <strong>{playing ? "Running" : "Paused"}</strong>
            </div>
            <div className="quick-row">
              <span>Speed</span>
              <strong>{speed}x</strong>
            </div>
            <div className="quick-row">
              <span>Game mode</span>
              <strong>Sandbox</strong>
            </div>
          </section>

        </aside>
      </section>

      <footer className="footer">
        WORLD SIMULATION GAME · VERSION 2.0 · SANDBOX EDITION
        <br />
        All country statistics are illustrative game values, not live data.
      </footer>

    </main>
  );
}
