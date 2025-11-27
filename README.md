# 📌 Game Overview

Chaturanga uses a three-lane vertical board where every piece moves only forward inside its lane.
The game includes friendly fire, lane-restricted attacks, and a strict summoning system that adds deep strategy.

This repository contains:

*   Complete rulebook
*   Game board layout
*   Movement, attack & summoning mechanics
*   Google AI Studio prompts
*   Antigravity IDE project files
*   Assets and ancient-style UI references

## 🎮 Key Game Features

### 🛡 Friendly Fire (Allowed)

*   Pieces can kill their own teammates if the move rules allow it.
*   This increases strategy and risk.

### 🟦 Lane-Based Movement

*   All pieces move only forward in their own lane.
*   Sideways or backward movement is not allowed unless a special rule exists.

### ✨ Summoning System

*   You can summon pieces only on specific front-facing tiles.
*   You cannot summon a king while your king is alive.
*   If your king dies, you may summon a new king in the allowed lane positions.

### 👑 King Mechanics

*   Kings cannot go into the opponent king’s left-lane starting tile.
*   Kings follow the same forward-movement restriction.
*   Summoning a king is allowed only when your previous king is dead.

### 🧱 Board Layout

*   The board follows a vertical 3-lane structure, matching the reference image.
*   All directions (front, back, left lane, right lane) are defined based on this orientation.

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| UI Generation | Google AI Studio |
| Development | Antigravity IDE |
| Assets | AI-generated ancient-themed icons |
| Game Logic | Rule-based (not Python) |

## 📘 Rulebook Summary

*   Forward-only movement
*   Sideways/backward not allowed
*   Summon only on front tiles
*   Cannot summon king when king is alive
*   After king dies → can summon new king
*   Friendly fire is allowed
*   Lane-based combat
*   Cannot reach opponent king’s left-side king tile
*   Victory condition: killing the enemy king

A full rulebook is included in `/rules`.

## 🎨 Ancient Theme

*   Sandstone color palette
*   Ancient inscriptions
*   Flat stones/tile board
*   Rustic piece designs
*   Light shadows & engraved symbols
*   Traditional war-style vibe

## 🤝 Contributing

You can submit suggestions for rule changes, UI updates, or improved prompts.

## 📜 License

Open-source — free to modify and adapt.
