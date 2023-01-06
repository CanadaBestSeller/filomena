# Test Cases

## Lobby

### Start
1. Click START (no auth) ➡️ Name? ➡️ Confirm ➡️ Random Room w/ Code
1. Click START (auth) ➡️ Random Room w/ Code
1. Visit `/start` (no auth) ➡️ Name? ➡️ Confirm ➡️ Random Room w/ Code
1. Visit `/start` (auth) ➡️ Random Room w/ Code

### Join
1. Click JOIN (no auth) ➡️ Name? ➡️ Confirm ➡️ Enter Code  ➡️ Room w/ Code
1. Click JOIN (auth) ➡️ Enter Code  ➡️ Room w/ Code
1. Visit `/enter` (no auth) ➡️ Name? ➡️ Confirm ➡️ Enter Code  ➡️ Room w/ Code
1. Visit `/enter` (auth) ➡️ Enter Code  ➡️ Room w/ Code

### Room
1. Visit `/CODE` (no auth) ➡️ Name? ➡️ Confirm ➡️ Room w/ Code
1. Visit `/CODE` (auth) ➡️ Room w/ Code

## Game

### Host
1. Host (no name) ➡️ cannot start game
2. Host (name) ➡️ starts game ➡️ everybody sees changed page

### Non-Host
1. Non-Host (no name) ➡️ join ➡️ shows up as `TBD`
2. Non-Host (name) ➡️ join ➡️ name shows up for everyone
