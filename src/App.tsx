import { useEffect, useState } from "react";
import CardScene from "./components/CardScene";
import { chooseCpuAction } from "./game/ai";
import { act, isLegal, newGame, SUITS, type Card, type GameState, type Suit } from "./game/rules";

type View = "table" | "studio";

function CardButton({ card, disabled, onPlay }: { card: Card; disabled: boolean; onPlay: () => void }) {
  const red = card.suit === "hearts" || card.suit === "diamonds";
  return (
    <button
      className={`hand-card${red ? " hand-card--red" : ""}`}
      type="button"
      disabled={disabled}
      onClick={onPlay}
      aria-label={`Play ${card.rank} of ${card.suit}`}
      data-playable={!disabled}
    >
      <span>{card.rank}</span>
      <small>{card.suit}</small>
    </button>
  );
}

export default function App() {
  const [view, setView] = useState<View>("table");
  const [game, setGame] = useState<GameState>(() => newGame());
  const [pendingEight, setPendingEight] = useState<Card | null>(null);
  const [studioTitle, setStudioTitle] = useState("Good things ahead");
  const [studioMessage, setStudioMessage] = useState("Make today a little brighter.");

  useEffect(() => {
    if (game.turn !== 1 || game.winner !== null || game.stalemate) return;
    const timeout = window.setTimeout(() => {
      setGame((current) => {
        if (current.turn !== 1 || current.winner !== null || current.stalemate) return current;
        return act(current, 1, chooseCpuAction(current));
      });
    }, 550);
    return () => window.clearTimeout(timeout);
  }, [game.turn, game.winner, game.drawn, game.hands[1].length, game.discard.at(-1)?.id, game.stock.length]);

  const topCard = game.discard.at(-1);
  if (!topCard) throw new Error("The game has no top card");
  const isHumanTurn = game.turn === 0 && game.winner === null && !game.stalemate;
  const humanCards = game.hands[0];

  function startNewGame() {
    setPendingEight(null);
    setGame(newGame());
  }

  function play(card: Card, suit?: Suit) {
    setPendingEight(null);
    setGame((current) => act(current, 0, { type: "play", cardId: card.id, suit }));
  }

  function requestPlay(card: Card) {
    if (card.rank === "8") setPendingEight(card);
    else play(card);
  }

  function draw() {
    setGame((current) => act(current, 0, { type: "draw" }));
  }

  function pass() {
    setGame((current) => act(current, 0, { type: "pass" }));
  }

  const status = game.stalemate
    ? "The game is a stalemate."
    : game.winner === 0
      ? "You won the game."
      : game.winner === 1
        ? "The CPU won the game."
      : isHumanTurn
        ? game.drawn
          ? "Choose a playable card or pass."
          : "Your turn."
        : "CPU turn.";

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Birthday Universe Demo home">Birthday Universe</a>
        <nav className="view-tabs" aria-label="Demo views">
          <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}>Card table</button>
          <button type="button" aria-pressed={view === "studio"} onClick={() => setView("studio")}>Card Studio</button>
        </nav>
      </header>

      <main id="top" className="main-content">
        {view === "table" ? (
          <section className="game-screen" aria-labelledby="game-title">
            <div className="screen-heading">
              <div>
                <p className="eyebrow">Local game · 2 seats</p>
                <h1 id="game-title">Crazy Eights</h1>
              </div>
              <button className="button button--secondary" type="button" onClick={startNewGame}>Start a new game</button>
            </div>

            <div className="game-layout">
              <section className="table-panel" aria-label="Game table">
                <div className="opponent-row">
                  <div>
                    <p className="section-label">CPU hand</p>
                    <p className="opponent-count">{game.hands[1].length} cards</p>
                  </div>
                  <div className="card-backs" aria-hidden="true">
                    {Array.from({ length: Math.min(game.hands[1].length, 6) }, (_, index) => (
                      <span className="card-back" key={index} />
                    ))}
                  </div>
                </div>

                <div className="table-center">
                  <CardScene card={topCard} activeSuit={game.suit} />
                  <div className="table-readout">
                    <p className="section-label">Active suit</p>
                    <p className={`active-suit active-suit--${game.suit}`}>{game.suit}</p>
                    <p className="stock-count">{game.stock.length} cards in stock</p>
                  </div>
                </div>

                <div className="player-row">
                  <div className="player-title">
                    <p className="section-label">Your hand</p>
                    <p className="hand-count">{humanCards.length} cards</p>
                  </div>
                  <div className="hand" aria-label="Your cards">
                    {humanCards.map((card) => (
                      <CardButton
                        key={card.id}
                        card={card}
                        disabled={!isHumanTurn || !isLegal(card, game)}
                        onPlay={() => requestPlay(card)}
                      />
                    ))}
                  </div>
                </div>

                <div className="turn-row">
                  <p role="status" aria-live="polite">{status}</p>
                  <div className="turn-actions">
                    <button className="button button--primary" type="button" onClick={draw} disabled={!isHumanTurn || game.drawn}>
                      Draw a card
                    </button>
                    {game.drawn && isHumanTurn && (
                      <button className="button button--secondary" type="button" onClick={pass}>Pass turn</button>
                    )}
                  </div>
                </div>
              </section>

              <aside className="rules-panel">
                <p className="section-label">How to play</p>
                <h2>Match a suit or rank</h2>
                <p>Play a matching card. An eight can name the active suit. Draw one card when you cannot play, then pass.</p>
                <div className="rule-line"><span>Players</span><strong>1 human + 1 CPU</strong></div>
                <div className="rule-line"><span>Deck</span><strong>52 cards</strong></div>
                <div className="rule-line"><span>Starting hand</span><strong>7 cards each</strong></div>
              </aside>
            </div>

            {(game.winner !== null || game.stalemate) && (
              <div className="result-banner" role="status">
                <p>{status}</p>
                <button className="button button--primary" type="button" onClick={startNewGame}>Play again</button>
              </div>
            )}

            {pendingEight && (
              <div className="suit-dialog" role="dialog" aria-modal="true" aria-labelledby="suit-title">
                <div className="suit-dialog__panel">
                  <h2 id="suit-title">Choose a suit</h2>
                  <div className="suit-options">
                    {SUITS.map((suit) => (
                      <button
                        className={`button button--secondary suit-option suit-option--${suit}`}
                        type="button"
                        key={suit}
                        onClick={() => play(pendingEight, suit)}
                      >
                        {suit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="studio-screen" aria-labelledby="studio-title">
            <div className="screen-heading">
              <div>
                <p className="eyebrow">Browser-local editor</p>
                <h1 id="studio-title">Card Studio</h1>
              </div>
            </div>
            <div className="studio-layout">
              <form className="studio-form" onSubmit={(event) => event.preventDefault()}>
                <label htmlFor="card-title">Card title</label>
                <input id="card-title" value={studioTitle} maxLength={36} onChange={(event) => setStudioTitle(event.target.value)} />
                <label htmlFor="card-message">Card message</label>
                <textarea id="card-message" value={studioMessage} maxLength={100} rows={4} onChange={(event) => setStudioMessage(event.target.value)} />
                <p className="form-note">Changes stay in this browser tab and clear when it reloads.</p>
              </form>
              <article className="studio-card" aria-label="Card preview">
                <div className="studio-card__mark" aria-hidden="true">B</div>
                <div>
                  <h2>{studioTitle || " "}</h2>
                  <p>{studioMessage || " "}</p>
                </div>
              </article>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Public demo content. No personal media, accounts, uploads, or network game sessions.</p>
      </footer>
    </div>
  );
}
