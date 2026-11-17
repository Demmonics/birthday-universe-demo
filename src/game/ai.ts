import { act, playableCards, SUITS, type Action, type GameState, type Seat, type Suit } from "./rules";

function chooseSuit(game: GameState, seat: Seat): Suit {
  const counts = new Map<Suit, number>(SUITS.map((suit) => [suit, 0]));
  for (const card of game.hands[seat]) {
    if (card.rank !== "8") counts.set(card.suit, (counts.get(card.suit) ?? 0) + 1);
  }
  return SUITS.reduce((best, suit) =>
    (counts.get(suit) ?? 0) > (counts.get(best) ?? 0) ? suit : best,
  SUITS[0]);
}

export function chooseCpuAction(game: GameState, seat: Seat = 1): Action {
  const playable = playableCards(game, seat);
  const card = playable.find((candidate) => candidate.rank !== "8") ?? playable[0];
  if (card) {
    return card.rank === "8"
      ? { type: "play", cardId: card.id, suit: chooseSuit(game, seat) }
      : { type: "play", cardId: card.id };
  }
  return game.drawn ? { type: "pass" } : { type: "draw" };
}

export function playCpuTurn(game: GameState, seat: Seat = 1, random: () => number = Math.random): GameState {
  let next = game;
  let action = chooseCpuAction(next, seat);
  next = act(next, seat, action, random);
  if (next.turn === seat && next.winner === null) {
    action = chooseCpuAction(next, seat);
    next = act(next, seat, action, random);
  }
  return next;
}
