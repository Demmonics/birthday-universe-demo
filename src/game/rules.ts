export const SUITS = ["hearts", "diamonds", "clubs", "spades"] as const;
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];
export type Seat = 0 | 1;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export interface GameState {
  stock: Card[];
  hands: [Card[], Card[]];
  discard: Card[];
  suit: Suit;
  turn: Seat;
  winner: Seat | null;
  stalemate: boolean;
  drawn: boolean;
}

export type Action =
  | { type: "play"; cardId: string; suit?: Suit }
  | { type: "draw" }
  | { type: "pass" };

export function deck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({
    id: `${suit[0].toUpperCase()}-${rank}`,
    suit,
    rank,
  })));
}

export function shuffle<T>(cards: readonly T[], random: () => number = Math.random): T[] {
  const result = [...cards];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError("Random source must return a value from 0 to less than 1");
    }
    const swapIndex = Math.floor(value * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function newGame(random: () => number = Math.random): GameState {
  const stock = shuffle(deck(), random);
  const hands: [Card[], Card[]] = [stock.splice(0, 7), stock.splice(0, 7)];
  const firstDiscard = stock.pop();
  if (!firstDiscard) throw new Error("Cannot start a game without a card to discard");
  return {
    stock,
    hands,
    discard: [firstDiscard],
    suit: firstDiscard.suit,
    turn: 0,
    winner: null,
    stalemate: false,
    drawn: false,
  };
}

export function isLegal(card: Card, game: GameState): boolean {
  return card.rank === "8" || card.suit === game.suit || card.rank === game.discard.at(-1)?.rank;
}

export function playableCards(game: GameState, seat: Seat = game.turn): Card[] {
  return game.hands[seat].filter((card) => isLegal(card, game));
}

function copyGame(game: GameState): GameState {
  return {
    stock: [...game.stock],
    hands: [[...game.hands[0]], [...game.hands[1]]],
    discard: [...game.discard],
    suit: game.suit,
    turn: game.turn,
    winner: game.winner,
    stalemate: game.stalemate,
    drawn: game.drawn,
  };
}

function recycle(game: GameState, random: () => number): void {
  if (game.stock.length > 0 || game.discard.length <= 1) return;
  const top = game.discard.pop();
  game.stock = shuffle(game.discard, random);
  game.discard = top ? [top] : [];
}

export function act(
  current: GameState,
  seat: Seat,
  action: Action,
  random: () => number = Math.random,
): GameState {
  const game = copyGame(current);
  if (game.winner !== null || game.stalemate || seat !== game.turn) throw new Error("Not your turn");

  if (action.type === "play") {
    const index = game.hands[seat].findIndex((card) => card.id === action.cardId);
    if (index < 0) throw new Error("Card not in your hand");
    const card = game.hands[seat][index];
    if (!isLegal(card, game)) throw new Error("Card does not match");
    if (card.rank === "8" && !action.suit) throw new Error("Choose a suit for the eight");
    if (action.suit && !SUITS.includes(action.suit)) throw new Error("Choose a valid suit");

    game.hands[seat].splice(index, 1);
    game.discard.push(card);
    game.suit = card.rank === "8" ? action.suit! : card.suit;
    game.drawn = false;
    if (game.hands[seat].length === 0) game.winner = seat;
    else game.turn = seat === 0 ? 1 : 0;
  } else if (action.type === "draw") {
    if (game.drawn) throw new Error("Already drew; play or pass");
    recycle(game, random);
    if (game.stock.length === 0) {
      game.stalemate = true;
      return game;
    }
    const card = game.stock.pop();
    if (!card) throw new Error("Cannot draw from an empty stock");
    game.hands[seat].push(card);
    game.drawn = true;
  } else if (action.type === "pass") {
    if (!game.drawn) throw new Error("Draw before passing");
    game.drawn = false;
    game.turn = seat === 0 ? 1 : 0;
  }

  return game;
}
