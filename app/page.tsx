
"use client";

import { useMemo, useState } from "react";
import { geoPath, geoNaturalEarth1 } from "d3-geo";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";

type Nation = {
  id: string;
  name: string;
  population: number;
  economy: number;
  treasury: number;
  stability: number;
  technology: number;
  relations: number;
};

type GameTab = "overview" | "economy" | "diplomacy" | "technology";

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

const palette = [
  "#547a91", "#9b7653", "#6b8c70", "#8871a8",
  "#a77b80", "#6e879e", "#8a9160", "#9b8068"
];

const initialNations: Nation[] = Object.entries(countryNames).map(
  ([id, name], index) => ({
    id,
    name,
    population: 8 + ((index * 19) % 150),
    economy: 70 + ((index * 37) % 950),
    treasury: 35 + ((index * 17) % 180),
    stability: 55 + ((index * 7) % 40),
    technology: 15 + ((index * 13) % 70),
    relations: 45 + ((index * 9) % 50)
  })
);

const world = feature(
  worldData as never,
  (worldData as any).objects.countries
) as any;

const projection = geoNaturalEarth1().fitSize([1200, 650], world);
const pathGenerator = geoPath(projection);

const money = (value: number) =>
  value >= 1000
    ? `$${(value / 1000).toFixed(2)}T`
    : `$${value.toFixed(1)}B`;

export default function Home() {
  const [nations, setNations] = useState<Record<string, Nation>>(
    () => Object.fromEntries(
      initialNations.map(nation => [nation.id, nation])
    )
  );

  const [selected, setSelected] = useState("840");
  const [target, setTarget] = useState("156");
  const [tab, setTab] = useState<GameTab>("overview");
  const [turn, setTurn] = useState(1);
  const [year, setYear] = useState(2026);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<string[]>([
    "The world has entered a new era.",
    "Choose a nation to begin your campaign."
  ]);

  const nation = nations[selected];

  const countries = useMemo(
    () => Object.values(nations).sort(
      (a, b) => a.name.localeCompare(b.name)
    ),
    [nations]
  );

  const filtered = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  function addEvent(message: string) {
    setEvents(current => [
      `Turn ${turn}: ${message}`,
      ...current
    ].slice(0, 15));
  }

  function selectNation(id: string) {
    if (!nations[id]) return;
    setSelected(id);
    addEvent(`${nations[id].name} selected.`);
  }

  function endTurn() {
    setNations(current => {
      const updated: Record<string, Nation> = {};

      Object.entries(current).forEach(([id, item]) => {
        const income = Math.max(1, item.economy * 0.012);

        updated[id] = {
          ...item,
          treasury: Number((item.treasury + income).toFixed(1)),
          economy: Number(
            (item.economy * 1.0015).toFixed(1)
          ),
          population: Number(
            (item.population * 1.0002).toFixed(2)
          ),
          stability: Math.min(
            99,
            Math.max(20, item.stability + (Math.random() - 0.5))
          )
        };
      });

      return updated;
    });

    setTurn(current => {
      if (current >= 12) {
        setYear(value => value + 1);
        return 1;
      }
      return current + 1;
    });

    setEvents(current => [
      `Turn ${turn}: A new turn has begun. National income collected.`,
      ...current
    ].slice(0, 15));
  }

  function investEconomy() {
    if (nation.treasury < 15) return;

    setNations(current => ({
      ...current,
      [selected]: {
        ...current[selected],
        treasury: current[selected].treasury - 15,
        economy: current[selected].economy + 25,
        stability: Math.min(99, current[selected].stability + 2)
      }
    }));

    addEvent(`${nation.name} invested in national development.`);
  }

  function investTechnology() {
    if (nation.treasury < 12 || nation.technology >= 100) return;

    setNations(current => ({
      ...current,
      [selected]: {
        ...current[selected],
        treasury: current[selected].treasury - 12,
        technology: Math.min(
          100,
          current[selected].technology + 5
        )
      }
    }));

    addEvent(`${nation.name} advanced its technology.`);
  }

  function diplomaticAction() {
    if (selected === target || nation.treasury < 8) return;

    const other = nations[target];

    setNations(current => ({
      ...current,
      [selected]: {
        ...current[selected],
        treasury: current[selected].treasury - 8,
        relations: Math.min(100, current[selected].relations + 5)
      },
      [target]: {
        ...current[target],
        relations: Math.min(100, current[target].relations + 3)
      }
    }));

    addEvent(
      `${nation.name} opened a diplomatic initiative with ${other.name}.`
    );
  }

  const selectedColor = palette[
    countries.findIndex(item => item.id === selected) % palette.length
  ];

  return (
    <main className="strategy-game">

      <header className="game-topbar">
        <div className="game-logo">
          <span className="logo-symbol">W</span>
          <div>
            <strong>WORLD SIMULATION</strong>
            <small>GRAND STRATEGY</small>
          </div>
        </div>

        <div className="campaign-info">
          <span>YEAR {year}</span>
          <span>TURN {turn}/12</span>
          <span>{countries.length} NATIONS</span>
        </div>

        <button className="end-turn-button" onClick={endTurn}>
          END TURN →
        </button>
      </header>

      <div className="game-layout">

        <aside className="game-menu">
          <div className="menu-label">CAMPAIGN</div>

          <button
            className={tab === "overview" ? "menu-button active" : "menu-button"}
            onClick={() => setTab("overview")}
          >
            ◈ Overview
          </button>

          <button
            className={tab === "economy" ? "menu-button active" : "menu-button"}
            onClick={() => setTab("economy")}
          >
            ▤ Economy
          </button>

          <button
            className={tab === "diplomacy" ? "menu-button active" : "menu-button"}
            onClick={() => setTab("diplomacy")}
          >
            ⇄ Diplomacy
          </button>

          <button
            className={tab === "technology" ? "menu-button active" : "menu-button"}
            onClick={() => setTab("technology")}
          >
            ✧ Technology
          </button>

          <div className="menu-divider" />

          <div className="menu-label">WORLD</div>
          <div className="menu-stat">
            <span>Countries</span>
            <strong>{countries.length}</strong>
          </div>
          <div className="menu-stat">
            <span>Selected</span>
            <strong>{nation.name}</strong>
          </div>
          <div className="menu-stat">
            <span>Game mode</span>
            <strong>Sandbox</strong>
          </div>

          <div className="menu-note">
            Turn-based world simulation.
          </div>
        </aside>

        <section className="map-section">
          <div className="map-toolbar">
            <div>
              <strong>POLITICAL MAP</strong>
              <small>SELECT A NATION ON THE MAP</small>
            </div>
            <div className="map-toolbar-actions">
              <button onClick={() => setSelected("840")}>RESET VIEW</button>
              <button onClick={endTurn}>NEXT TURN</button>
            </div>
          </div>

          <div className="political-map">
            <svg
              viewBox="0 0 1200 650"
              className="political-svg"
              role="img"
              aria-label="Political map of the world"
            >
              {world.features.map((item: any) => {
                const id = String(item.id);
                const index = countries.findIndex(
                  country => country.id === id
                );

                const isPlayable = index >= 0;
                const color = isPlayable
                  ? palette[index % palette.length]
                  : "#29343b";

                return (
                  <path
                    key={id}
                    d={pathGenerator(item) || ""}
                    fill={selected === id ? "#b9f27c" : color}
                    className={
                      selected === id
                        ? "map-country selected"
                        : isPlayable
                          ? "map-country playable"
                          : "map-country"
                    }
                    onClick={() => selectNation(id)}
                  >
                    <title>
                      {countryNames[id] || "Unlisted territory"}
                    </title>
                  </path>
                );
              })}
            </svg>

            <div className="map-overlay">
              <span className="map-live-dot" />
              POLITICAL BORDERS · YEAR {year}
            </div>

            <div className="map-selected">
              <small>SELECTED NATION</small>
              <strong>{nation.name}</strong>
              <span>{money(nation.economy)} GDP</span>
            </div>
          </div>

          <div className="map-bottom-bar">
            <span><i className="legend-selected" /> Selected nation</span>
            <span><i className="legend-country" /> Playable nations</span>
            <span><i className="legend-neutral" /> Other territories</span>
            <span>WORLD MAP</span>
          </div>

          <section className="world-events">
            <div className="events-heading">
              <strong>WORLD CHRONICLE</strong>
              <span>RECENT EVENTS</span>
            </div>
            <div className="events-list">
              {events.slice(0, 4).map((event, index) => (
                <div className="world-event" key={`${event}-${index}`}>
                  <i />
                  {event}
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="country-panel">
          <div className="country-panel-heading">
            <small>COUNTRY MANAGEMENT</small>
            <h2>{nation.name}</h2>
            <span className="country-id">COUNTRY ID: {nation.id}</span>
          </div>

          <div className="country-flag-block" style={{
            background: `linear-gradient(135deg, ${selectedColor}, #18242b)`
          }}>
            <span>{nation.name.slice(0, 2).toUpperCase()}</span>
            <small>YOUR SELECTED NATION</small>
          </div>

          <div className="country-tabs">
            <button
              className={tab === "overview" ? "active" : ""}
              onClick={() => setTab("overview")}
            >STATS</button>
            <button
              className={tab === "economy" ? "active" : ""}
              onClick={() => setTab("economy")}
            >ECONOMY</button>
            <button
              className={tab === "diplomacy" ? "active" : ""}
              onClick={() => setTab("diplomacy")}
            >DIPLOMACY</button>
          </div>

          {tab === "overview" && (
            <div className="country-panel-content">
              <div className="big-stat">
                <small>ECONOMY</small>
                <strong>{money(nation.economy)}</strong>
              </div>

              <div className="country-stat-grid">
                <div>
                  <small>POPULATION</small>
                  <strong>{nation.population.toFixed(1)}M</strong>
                </div>
                <div>
                  <small>TREASURY</small>
                  <strong>{money(nation.treasury)}</strong>
                </div>
                <div>
                  <small>STABILITY</small>
                  <strong>{nation.stability.toFixed(0)}%</strong>
                </div>
                <div>
                  <small>TECHNOLOGY</small>
                  <strong>{nation.technology}%</strong>
                </div>
              </div>

              <div className="stat-progress">
                <div><span>Stability</span><b>{nation.stability.toFixed(0)}%</b></div>
                <div className="progress-line">
                  <i style={{ width: `${nation.stability}%` }} />
                </div>
              </div>

              <div className="stat-progress">
                <div><span>Technology</span><b>{nation.technology}%</b></div>
                <div className="progress-line">
                  <i style={{ width: `${nation.technology}%` }} />
                </div>
              </div>
            </div>
          )}

          {tab === "economy" && (
            <div className="country-panel-content">
              <div className="big-stat">
                <small>NATIONAL TREASURY</small>
                <strong>{money(nation.treasury)}</strong>
              </div>
              <p className="panel-description">
                Invest in your country's economy. Development costs 15B.
              </p>
              <button
                className="management-action"
                disabled={nation.treasury < 15}
                onClick={investEconomy}
              >
                <strong>＋ National development</strong>
                <small>Cost: $15B · Increase economy</small>
              </button>
            </div>
          )}

          {tab === "diplomacy" && (
            <div className="country-panel-content">
              <div className="big-stat">
                <small>RELATIONS INDEX</small>
                <strong>{nation.relations}/100</strong>
              </div>

              <label className="target-label" htmlFor="diplomacy-target">
                SELECT A COUNTRY
              </label>
              <select
                id="diplomacy-target"
                value={target}
                onChange={event => setTarget(event.target.value)}
                className="nation-select"
              >
                {countries
                  .filter(item => item.id !== selected)
                  .map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>

              <button
                className="management-action"
                disabled={nation.treasury < 8 || target === selected}
                onClick={diplomaticAction}
              >
                <strong>⇄ Diplomatic initiative</strong>
                <small>Cost: $8B · Improve relations</small>
              </button>
            </div>
          )}

          {tab === "technology" && (
            <div className="country-panel-content">
              <div className="big-stat">
                <small>TECHNOLOGY LEVEL</small>
                <strong>{nation.technology}%</strong>
              </div>
              <p className="panel-description">
                Support science and innovation in your nation.
              </p>
              <button
                className="management-action"
                disabled={nation.treasury < 12 || nation.technology >= 100}
                onClick={investTechnology}
              >
                <strong>✧ Research investment</strong>
                <small>Cost: $12B · Technology +5</small>
              </button>
            </div>
          )}

          <div className="country-panel-footer">
            <span>GAME TURN</span>
            <strong>{turn} / 12</strong>
          </div>
        </aside>
      </div>

      <footer className="game-footer">
        WORLD SIMULATION GAME · GRAND STRATEGY EDITION · VERSION 3.0
        <span>Illustrative game data · Not live statistics</span>
      </footer>
    </main>
  );
}
