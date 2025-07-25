import React, { useState, useEffect } from "react";
import "./App.css";
import Chat from "./Chat";

/**
 * -- COLOR PALETTE (from requirements) --
 * --primary:    #1976d2
 * --secondary:  #eeeeee
 * --accent:     #ff9800
 * For minimal modern style, base is light (white), with subdued primary.
 */

// SQUARE component represents one cell of the board
function Square({ value, onClick, highlight }) {
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      style={{
        background: highlight ? "var(--ttt-accent)" : "var(--ttt-secondary)",
        color: value === "X" ? "var(--ttt-primary)" : "var(--ttt-accent)",
        borderColor: highlight
          ? "var(--ttt-primary)"
          : "var(--ttt-board-border)"
      }}
      aria-label={value ? `Cell ${value}` : "Empty"}
    >
      {value}
    </button>
  );
}

// MAIN APP COMPONENT
// PUBLIC_INTERFACE
function App() {
  // "human" or "cpu"
  const [playerMode, setPlayerMode] = useState("human");
  // true if X is next, false means O's turn
  const [xIsNext, setXisNext] = useState(true);
  // 9 board cells (null | "X" | "O")
  const [board, setBoard] = useState(Array(9).fill(null));
  // "X", "O", or null, plus line for winning cells
  const [winnerInfo, setWinnerInfo] = useState({ winner: null, line: [] });
  // Count moves (for draw state)
  const [moveCount, setMoveCount] = useState(0);

  // Setup color variables on body for custom theme
  useEffect(() => {
    document.body.style.setProperty("--ttt-primary", "#1976d2");
    document.body.style.setProperty("--ttt-secondary", "#eeeeee");
    document.body.style.setProperty("--ttt-accent", "#ff9800");
    document.body.style.setProperty("--ttt-board-border", "#b0bec5");
    document.body.style.setProperty("--ttt-bg-main", "#fafbfc");
    document.body.style.setProperty("--ttt-text-main", "#24292f");
  }, []);

  // Resets the game board
  // PUBLIC_INTERFACE
  function resetGame() {
    setBoard(Array(9).fill(null));
    setXisNext(true);
    setWinnerInfo({ winner: null, line: [] });
    setMoveCount(0);
  }

  // Change player mode and reset on switch
  function handlePlayerSelect(mode) {
    setPlayerMode(mode);
    resetGame();
  }

  // Compute winner/draw state after every move
  useEffect(() => {
    const result = calculateWinner(board);
    setWinnerInfo(result);
  }, [board]);

  // AI Move (CPU as O, only if playerMode=="cpu" and not gameover)
  useEffect(() => {
    if (
      playerMode === "cpu" &&
      !winnerInfo.winner &&
      !isDraw(board) &&
      !xIsNext // Computer is always "O"
    ) {
      const aiMove = computeBestMove(board, "O", "X");
      if (aiMove !== null) {
        setTimeout(() => {
          handleSquareClick(aiMove);
        }, 500); // Small delay for realism
      }
    }
    // eslint-disable-next-line
  }, [xIsNext, playerMode, winnerInfo, moveCount]);

  // User click handler for a cell
  // PUBLIC_INTERFACE
  function handleSquareClick(i) {
    if (board[i] || winnerInfo.winner) return;
    if (playerMode === "cpu" && !xIsNext) return; // Don't allow human to move as "O"

    const newBoard = [...board];
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXisNext(!xIsNext);
    setMoveCount((prev) => prev + 1);
  }

  // Display state above the board
  let gameStatus = "";
  if (winnerInfo.winner) {
    gameStatus = `Winner: ${winnerInfo.winner}`;
  } else if (isDraw(board)) {
    gameStatus = "It's a draw!";
  } else {
    gameStatus =
      playerMode === "human"
        ? `Next: ${xIsNext ? "X" : "O"}`
        : xIsNext
        ? "Your turn (X)"
        : "Computer's turn (O)";
  }

  return (
    <div className="ttt-app-root" style={{ background: "var(--ttt-bg-main)" }}>
      {/* HEADER/STATE */}
      <div className="ttt-header">
        <h1 className="ttt-title">
          <span role="img" aria-label="trophy">
            🎯
          </span>{" "}
          Tic Tac Toe
        </h1>
        <div className="ttt-mode-picker">
          <button
            type="button"
            className={
              "ttt-mode-btn" +
              (playerMode === "human" ? " ttt-active-mode" : "")
            }
            style={{
              color: "var(--ttt-primary)",
              borderColor:
                playerMode === "human"
                  ? "var(--ttt-primary)"
                  : "var(--ttt-board-border)"
            }}
            onClick={() => handlePlayerSelect("human")}
          >
            2 Players
          </button>
          <button
            type="button"
            className={
              "ttt-mode-btn" + (playerMode === "cpu" ? " ttt-active-mode" : "")
            }
            style={{
              color: "var(--ttt-accent)",
              borderColor:
                playerMode === "cpu"
                  ? "var(--ttt-accent)"
                  : "var(--ttt-board-border)"
            }}
            onClick={() => handlePlayerSelect("cpu")}
          >
            Play vs Computer
          </button>
        </div>
        <div className="ttt-gamestate" aria-live="polite">
          {gameStatus}
        </div>
      </div>
      {/* BOARD */}
      <div className="ttt-board-wrapper">
        <Board
          squares={board}
          onClick={handleSquareClick}
          winLine={winnerInfo.line}
        />
      </div>
      {/* BOTTOM CONTROL */}
      <div className="ttt-bottom-controls">
        <button
          className="ttt-restart-btn"
          type="button"
          onClick={resetGame}
          aria-label="Restart Game"
        >
          Restart
        </button>
      </div>
      <footer className="ttt-footer">
        <small>
          Modern Tic Tac Toe • By Kavia • Minimal UI Demo
        </small>
      </footer>

      {/* AI Chat interface */}
      <Chat />
    </div>
  );
}

// BOARD: displays 3x3 grid of SQUAREs
function Board({ squares, onClick, winLine = [] }) {
  function renderSquare(idx) {
    return (
      <Square
        key={idx}
        value={squares[idx]}
        onClick={() => onClick(idx)}
        highlight={winLine.includes(idx)}
      />
    );
  }
  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe Board">
      {[0, 1, 2].map((row) => (
        <div className="ttt-board-row" key={row} role="row">
          {[0, 1, 2].map((col) => {
            const idx = row * 3 + col;
            return (
              <span role="gridcell" key={idx}>
                {renderSquare(idx)}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Determine whether there is a winner on the board.
 * Returns { winner: "X"|"O"|null, line: [indices] }
 * PUBLIC_INTERFACE
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let l = 0; l < lines.length; l++) {
    const [a, b, c] = lines[l];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: lines[l] };
    }
  }
  return { winner: null, line: [] };
}

/**
 * True if board is full and no winner.
 * PUBLIC_INTERFACE
 */
function isDraw(squares) {
  return squares.every((sq) => sq !== null) && !calculateWinner(squares).winner;
}

/**
 * Compute "AI" move for current position. Defensive strategy:
 * - Win if possible, otherwise block, otherwise pick center/corner/side.
 * PUBLIC_INTERFACE
 */
function computeBestMove(squares, aiMark, humanMark) {
  const available = squares
    .map((val, idx) => (val === null ? idx : null))
    .filter((v) => v !== null);

  // Try winning move
  for (const idx of available) {
    const test = [...squares];
    test[idx] = aiMark;
    if (calculateWinner(test).winner === aiMark) return idx;
  }
  // Try blocking move
  for (const idx of available) {
    const test = [...squares];
    test[idx] = humanMark;
    if (calculateWinner(test).winner === humanMark) return idx;
  }
  // Center
  if (available.includes(4)) return 4;
  // Corners
  const corners = [0, 2, 6, 8].filter((i) => available.includes(i));
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // Sides
  if (available.length) return available[Math.floor(Math.random() * available.length)];
  return null;
}

export default App;
