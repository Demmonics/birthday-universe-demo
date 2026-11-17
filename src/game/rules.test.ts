import { describe, expect, it } from "vitest";
import { chooseCpuAction, playCpuTurn } from "./ai";
import { act, deck, newGame, playableCards, type Card, type GameState } from "./rules";

const card = (id: string, suit: Card["suit"], rank: Card["rank"]): Card => ({ id, suit, rank });

function state(overrides: Partial<GameState> = {}): GameState {
  return {
    stock: [],
    hands: [
      [card("H-8", "hearts", "8")],
      [card("C-2", "clubs", "2")],
    ],
    discard: [card("S-3", "spades", "3")],
    suit: "spades",
    turn: 0,
    winner: null,
    stalemate: false,
    drawn: false,
    ...overrides,
  };
}

describe("Crazy Eights rules", () => {
  it("deals a complete 52-card deck into two seven-card hands and a stock", () => {
    const game = newGame(() => 0);
    expect(deck()).toHaveLength(52);
    expect(new Set(deck().map(({ id }) => id)).size).toBe(52);
    expect(game.hands.map((hand) => hand.length)).toEqual([7, 7]);
    expect(game.stock.length + game.hands[0].length + game.hands[1].length + game.discard.length).toBe(52);
  });

  it("enforces turns, allows matching ranks, and requires suit choice for an eight", () => {
    const game = state({
      hands: [
        [card("H-8", "hearts", "8"), card("D-3", "diamonds", "3")],
        [card("C-2", "clubs", "2")],
      ],
    });
    expect(() => act(game, 1, { type: "play", cardId: "C-2" })).toThrow("Not your turn");
    expect(() => act(game, 0, { type: "play", cardId: "H-8" })).toThrow("Choose a suit");
    const mismatch = state({
      hands: [
        [card("H-2", "hearts", "2")],
        [card("C-2", "clubs", "2")],
      ],
    });
    expect(() => act(mismatch, 0, { type: "play", cardId: "H-2" })).toThrow("Card does not match");

    const played = act(game, 0, { type: "play", cardId: "H-8", suit: "diamonds" });
    expect(played.suit).toBe("diamonds");
    expect(played.turn).toBe(1);
    expect(game.hands[0]).toHaveLength(2);
  });

  it("ends the game when a player plays their last card", () => {
    const game = state({
      hands: [
        [card("H-3", "hearts", "3")],
        [card("C-2", "clubs", "2")],
      ],
    });
    const won = act(game, 0, { type: "play", cardId: "H-3" });
    expect(won.winner).toBe(0);
    expect(won.turn).toBe(0);
  });

  it("recycles the discard pile and requires a draw before passing", () => {
    const game = state({
      stock: [],
      hands: [
        [card("H-2", "hearts", "2")],
        [card("C-2", "clubs", "2")],
      ],
      discard: [
        card("S-3", "spades", "3"),
        card("S-4", "spades", "4"),
        card("S-5", "spades", "5"),
      ],
      suit: "spades",
    });
    expect(() => act(game, 0, { type: "pass" })).toThrow("Draw before passing");

    const drawn = act(game, 0, { type: "draw" }, () => 0);
    expect(drawn.drawn).toBe(true);
    expect(drawn.discard.map(({ id }) => id)).toEqual(["S-5"]);
    expect(drawn.hands[0]).toHaveLength(2);
    expect(() => act(drawn, 0, { type: "draw" })).toThrow("Already drew");
    expect(act(drawn, 0, { type: "pass" }).turn).toBe(1);
  });

  it("ends in a stalemate when neither stock nor recyclable discards remain", () => {
    const game = state({
      stock: [],
      hands: [
        [card("H-2", "hearts", "2")],
        [card("C-2", "clubs", "2")],
      ],
      discard: [card("S-5", "spades", "5")],
      suit: "spades",
    });
    const ended = act(game, 0, { type: "draw" });
    expect(ended.stalemate).toBe(true);
    expect(ended.turn).toBe(0);
    expect(() => act(ended, 0, { type: "draw" })).toThrow("Not your turn");
  });

  it("lets the CPU choose a legal card or draw and pass", () => {
    const game = state({
      hands: [
        [card("H-2", "hearts", "2")],
        [card("D-2", "diamonds", "2"), card("C-8", "clubs", "8")],
      ],
    });
    expect(playableCards(game, 1).map(({ id }) => id)).toContain("C-8");
    expect(chooseCpuAction(game)).toMatchObject({ type: "play", cardId: "C-8", suit: "diamonds" });
    expect(chooseCpuAction(state({ drawn: true }))).toEqual({ type: "pass" });

    const cpuGame = { ...game, turn: 1 as const };
    const next = playCpuTurn(cpuGame);
    expect(next.discard.at(-1)?.id).toBe("C-8");
    expect(next.suit).toBe("diamonds");
  });
});
