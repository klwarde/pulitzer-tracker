import { useState, useEffect } from "react";
import "./App.css";

const STORAGE_KEY = "pulitzer_book_states";

// Three states: "unread" | "reading" | "read"
function loadStates() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStates(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function nextState(current) {
  if (!current || current === "unread") return "reading";
  if (current === "reading") return "read";
  return "unread";
}

export default function App() {
  const [data, setData] = useState(null);
  const [states, setStates] = useState(() => loadStates());

  useEffect(() => {
    fetch("/books.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  function cycle(year) {
    setStates((prev) => {
      const next = { ...prev, [year]: nextState(prev[year]) };
      saveStates(next);
      return next;
    });
  }

  function getState(year) {
    return states[year] || "unread";
  }

  if (!data) {
    return (
      <div className="loading">
        <span>Loading your reading path…</span>
      </div>
    );
  }

  const allBooks = data.decades.flatMap((d) => d.books.filter((b) => b.award));
  const totalBooks = allBooks.length;
  const readCount = allBooks.filter((b) => getState(b.year) === "read").length;
  const readingBooks = allBooks.filter((b) => getState(b.year) === "reading");
  const remaining = totalBooks - readCount - readingBooks.length;

  // Next unread book in chronological order
  const nextBook = allBooks.find((b) => getState(b.year) === "unread");

  // Current decade: first with unread or reading books
  const currentDecade = data.decades.find((d) =>
    d.books.some((b) => b.award && getState(b.year) !== "read")
  );

  const progressPct = Math.round((readCount / totalBooks) * 100);

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-eyebrow">1918 → Present</div>
        <h1 className="site-title">Pulitzer Fiction</h1>
        <div className="site-subtitle">Reading Challenge</div>
      </header>

      {/* Progress Panel */}
      <section className="progress-panel">
        <div className="progress-stats">
          <div className="progress-ring-wrap">
            <svg className="progress-ring" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" className="ring-track" />
              <circle
                cx="40" cy="40" r="34"
                className="ring-fill"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPct / 100)}`}
              />
            </svg>
            <div className="ring-label">
              <span className="ring-count">{readCount}</span>
              <span className="ring-sub">of {totalBooks}</span>
            </div>
          </div>

          <div className="stat">
            <span className="stat-value">{readCount}</span>
            <span className="stat-label">Read</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">{remaining}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">{currentDecade?.label ?? "—"}</span>
            <span className="stat-label">Current Decade</span>
          </div>
          <div className="stat-divider" />
          <div className="stat stat-next">
            {readingBooks.length > 0 ? (
              <>
                <span className="stat-value next-title reading-title">
                  {readingBooks.map(b => b.title).join(", ")}
                </span>
                <span className="stat-label">Currently Reading</span>
              </>
            ) : (
              <>
                <span className="stat-value next-title">{nextBook?.title ?? "All done!"}</span>
                <span className="stat-label">
                  {nextBook ? `${nextBook.year} · ${nextBook.author}` : ""}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="overall-bar-wrap">
          <span className="bar-label">Overall Progress</span>
          <div className="overall-bar">
            <div className="overall-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="bar-pct">{progressPct}%</span>
        </div>
      </section>

      {/* Legend */}
      <div className="legend">
        <span className="legend-item">
          <span className="legend-swatch swatch-read" />
          Read
        </span>
        <span className="legend-item">
          <span className="legend-swatch swatch-reading" />
          Currently Reading
        </span>
        <span className="legend-item">
          <span className="legend-swatch swatch-unread" />
          Unread
        </span>
        <span className="legend-item">
          <span className="legend-swatch swatch-noaward" />
          No Award
        </span>
      </div>

      {/* Reading Path */}
      <section className="reading-path">
        <h2 className="path-heading">
          <span className="path-heading-line" />
          The Reading Path
          <span className="path-heading-line" />
        </h2>

        <div className="decades-snake">
          {data.decades.map((decade, di) => (
            <div
              key={decade.id}
              className={`decade-row ${di % 2 === 1 ? "decade-row--reverse" : ""}`}
            >
              <div className="decade-label-block">
                <div className="decade-year">{decade.label}</div>
                <div className="decade-range">{decade.range}</div>
                <div className="decade-icon">📚</div>
              </div>

              <div className="decade-books">
                {decade.books.map((book) =>
                  book.award ? (
                    <button
                      key={`${book.year}-${book.title}`}
                      className={`book-tile book-tile--${getState(book.year)}`}
                      onClick={() => cycle(book.year)}
                      title={`${book.title} — ${book.author} (${book.year})\nClick to cycle: Unread → Reading → Read`}
                    >
                      <span className="tile-year">{book.year}</span>
                      <span className="tile-title">{book.title}</span>
                      <span className="tile-author">{book.author}</span>
                      {getState(book.year) === "read" && (
                        <span className="tile-badge tile-check">✓</span>
                      )}
                      {getState(book.year) === "reading" && (
                        <span className="tile-badge tile-bookmark">🔖</span>
                      )}
                    </button>
                  ) : (
                    <div key={`${book.year}-noaward`} className="book-tile book-tile--noaward">
                      <span className="tile-year">{book.year}</span>
                      <span className="tile-noaward">No Award</span>
                    </div>
                  )
                )}
              </div>

              {di < data.decades.length - 1 && (
                <div className={`snake-arrow ${di % 2 === 1 ? "snake-arrow--left" : "snake-arrow--right"}`}>
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <p>Click any book to cycle through: Unread → Currently Reading → Read. Progress saves in your browser.</p>
      </footer>
    </div>
  );
}
