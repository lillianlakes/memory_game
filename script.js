"use strict";

/** Memory game: find matching pairs of cards and flip both of them. */

const FOUND_MATCH_WAIT_MSECS = 1000;

const POSSIBLE_COLORS = ["red", "orange", "yellow", "green", "blue", "purple", "brown", "deeppink", "peachpuff", "aquamarine","lightblue", "plum"];

let secondsElapsed = document.querySelector('#secondsElapsed');

let difficulty = Number(document.querySelector("#difficulty").value);

let colorSelection = selectTwice(POSSIBLE_COLORS, difficulty);

const colors = shuffle(colorSelection); 

createCards(colors);

const cards = document.querySelectorAll('.card');

const showCards = document.querySelector('.showCards');

const restart = document.querySelector('.restart');

const PlayAgain = new CustomConfirm();

/* Track performance */
let matches = document.querySelector('#matches');
let movesCount = document.querySelector('#moves');
let matchCount = 0;
let moves = 0;

let timer;
let sec = 0;

/* Prevent overclicking */
let card1, card2;
let gameLock = false;

/** Select each color twice from possible colors */
function selectTwice(array, num) {
  const OUTPUT = [];
  for (let i = 0; i < num; i++) {
    OUTPUT[i] = array[i];
    OUTPUT[num + i] = array[i];
  }
  return OUTPUT;
}

/** Shuffle array items in-place and return shuffled array. */
function shuffle(items) {
  // This algorithm does a "perfect shuffle", where there won't be any
  // statistical bias in the shuffle (many naive attempts to shuffle end up not
  // be a fair shuffle). This is called the Fisher-Yates shuffle algorithm; if
  // you're interested, you can learn about it, but it's not important.
  for (let i = items.length - 1; i > 0; i--) {
    // generate a random index between 0 and i
    let j = Math.floor(Math.random() * i);
    // swap item at i <-> item at j
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** Create card for every color in colors (each will appear twice)
 *
 * Each div DOM element will have:
 * - a class with the value of the color
 * - a click listener for each card to handleCardClick
 */
function createCards(colors) {
  const gameBoard = document.querySelector("#game");
  gameBoard.innerHTML = "";

  for (let color of colors) {
    const card = document.createElement("div");
    card.classList.add("card", "card-back");
    card.setAttribute("data-color", color);
    card.addEventListener("click", handleCardClick);
    gameBoard.append(card);
  }
}

document.querySelector('#difficulty').addEventListener('input',function (evt) {
  if (!gameLock) {
    difficulty = parseInt(evt.target.value); // this.value
    const pairs = document.querySelector('#pairs');
    pairs.innerText = difficulty;
    colorSelection = selectTwice(POSSIBLE_COLORS, difficulty);
    const colors = shuffle(colorSelection);
    createCards(colors);
    if (timer) {
      clearInterval(timer);
      timer = undefined;
      sec = 0;
      secondsElapsed.textContent = sec;
      moves = 0;
      movesCount.innerText = moves;
      matchCount = 0;
      matches.innerText = matchCount;
      card1 = undefined;
      card2 = undefined;
    }
  }
});

function trackSeconds() {
  sec++;
  secondsElapsed.innerText = sec;
}

/* Option to play again when game is complete */
function updateMatches() {
  if (matchCount === difficulty) {
    clearInterval(timer);
    setTimeout(function () {
      return PlayAgain.render();
    }, FOUND_MATCH_WAIT_MSECS);
  }
  matches.innerText = matchCount;
  return;
}

updateMatches();

// Reset comparison cards in event of a match or mismatch
function resetHand() {
  card1 = undefined;
  card2 = undefined;
  moves++;
  movesCount.innerText = moves;
}

/** Flip a card face-up. */
function flipCard(card) {
  if (gameLock) return;

  // Update card1 and card2 for comparison
  if (!card1 && !card2) {
    card1 = card;
    return;

  } else if (card1 && !card2 && card !== card1) {
    card2 = card;
    gameLock = true;

    // Compare both cards. If a match, keep flipped. If not, unflip them. 

    // If a match, remove ability to click, update match count and refresh hand.
    if (card1.getAttribute("data-color") === card2.getAttribute("data-color")) {
      card1.removeEventListener("click", handleCardClick);
      card2.removeEventListener("click", handleCardClick);
      gameLock = false;
      matchCount++;
      resetHand();
      updateMatches();
      return;

      // If not a match, unflip cards and refresh hand.
    } else {
      unFlipCard(card1);
      unFlipCard(card2);
      resetHand();
      return;
    }
  }
}

/** Flip a card face-down after 1 second. */
function unFlipCard(card) {
  setTimeout(function () {
    card.classList.add("card-back");
    gameLock = false;
  }, FOUND_MATCH_WAIT_MSECS);
}

/* Delay clicks by 1 second */
function delayClick(){
  for (let card of cards){
    card.classList.add('delay-click');
  }
  setTimeout(function(){
    for (let card of cards) {
    card.classList.remove('delay-click');
    }
  }, FOUND_MATCH_WAIT_MSECS);
}

/** Handle clicking on a card: this could be first-card or second-card. */
function handleCardClick(evt) {
  if (!gameLock) {
    delayClick();
    let currentCard = evt.target; // this
    currentCard.classList.remove("card-back");
    currentCard.style.backgroundColor = currentCard.getAttribute("data-color");
    flipCard(currentCard);
    currentCard.classList.remove('delay-click');
  }
  if (!timer) timer = setInterval(trackSeconds, FOUND_MATCH_WAIT_MSECS);
}

/* Buttons to restart the game or show all cards */
showCards.addEventListener('click', function(){
  for (let card of cards) {
    card.classList.remove('card-back');
    card.style.backgroundColor = card.getAttribute("data-color");
    card.removeEventListener("click", handleCardClick);
  }
  clearInterval(timer);
  timer = undefined;
  gameLock = true;
});

restart.addEventListener('click', function() {
  location.reload();
});

function CustomConfirm() {
  this.render = function () {
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const dialogoverlay = document.querySelector('#dialogoverlay');
    const dialogbox = document.querySelector('#dialogbox');
    dialogoverlay.style.display = "block";
    dialogoverlay.style.height = winH + "px";
    dialogbox.style.left = (winW / 8) + "px";
    dialogbox.style.top = (winH / 5) + "px";
    dialogbox.style.display = "block";

    document.querySelector('#dialogboxhead').innerHTML = "<img src='https://i.ibb.co/Y75hP0y/you-won.png' width = 50%>";
    document.querySelector('#dialogboxbody').innerHTML = 'Would you like to play again?';
    document.querySelector('#dialogboxfoot').innerHTML = '<button onclick="PlayAgain.yes()">Yes</button> <button onclick="PlayAgain.no()">No</button>';
  }
  this.no = function () {
    document.querySelector('#dialogbox').style.display = "none";
    document.querySelector('#dialogoverlay').style.display = "none";
  }
  this.yes = function () {
    location.reload();
    document.querySelector('#dialogbox').style.display = "none";
    document.querySelector('#dialogoverlay').style.display = "none";
  }
}