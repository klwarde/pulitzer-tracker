import { useState, useEffect } from "react";
import "./App.css";

const STORAGE_KEY = "pulitzer_read_books";

function loadRead() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveRead(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export default function App() {
  const [data, setData] = useState(null);
  const [read, setRead] = useState(() => loadRead());

  useEffect(() => {
    fetch("/books.json")
      .then((r) => r.json())
      .then(setData);
  }, []);

  function toggle(year) {
    setRead((prev) => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      saveRead(next);
      return next;
    });
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
  const readCount = allBooks.filter((b) => read.has(b.year)).length;
  const remaining = totalBooks - readCount;

  // Find next unread book in chronological order
  const nextBook = allBooks.find((b) => !read.has(b.year));

  // Find current decade (first decade with unread books)
  const currentDecade = data.decades.find((d) =>
    d.books.some((b) => b.award && !read.has(b.year))
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
        <div className="progress-ring-wrap">
          <svg className="progress-ring" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" className="ring-track" />
            <circle
              cx="40"
              cy="40"
              r="34"
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

        <div className="progress-stats">
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
            <span className="stat-value next-title">{nextBook?.title ?? "All done!"}</span>
            <span className="stat-label">
              {nextBook ? `${nextBook.year} · ${nextBook.author}` : ""}
            </span>
          </div>
        </div>

        <div className="overall-bar-wrap">
          <span className="bar-label">Overall Progress</span>
          <div className="overall-bar">
            <div
              className="overall-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
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
                      key={book.year}
                      className={`book-tile ${read.has(book.year) ? "book-tile--read" : "book-tile--unread"}`}
                      onClick={() => toggle(book.year)}
                      title={`${book.title} — ${book.author} (${book.year})\nClick to toggle read`}
                    >
                      <span className="tile-year">{book.year}</span>
                      <span className="tile-title">{book.title}</span>
                      <span className="tile-author">{book.author}</span>
                      {read.has(book.year) && (
                        <span className="tile-check">✓</span>
                      )}
                    </button>
                  ) : (
                    <div key={book.year} className="book-tile book-tile--noaward">
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
        <p>Click any book to mark it as read. Progress is saved in your browser.</p>
      </footer>
    </div>
  );
}
