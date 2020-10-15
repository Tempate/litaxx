/*  This file is part of Litaxx.

    Litaxx is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Litaxx is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Litaxx. If not, see <https://www.gnu.org/licenses/>.
*/

const STONE_CLASS = {
    "white": "white-stone",
    "black": "black-stone"
};

function updateCounters() {
    const counter = countStones();

    // Set numeric counters
    document.querySelector("#numeric-black-stone-counter").innerHTML = counter["black"];
    document.querySelector("#numeric-white-stone-counter").innerHTML = counter["white"];

    setBarCounter(counter);
}

function countStones() {
    let counter = {
        "white": 0,
        "black": 0
    };

    for (let square = 0; square < 49; square++) {
        const stone = document.getElementById("p" + square);

        if (!stone) {
            continue;
        } else if (stone.classList.contains(STONE_CLASS["black"])) {
            counter["black"]++;
        } else if (stone.classList.contains(STONE_CLASS["white"])) {
            counter["white"]++;
        }
    }

    return counter;
}

function setBarCounter(counter) {
    const barSquares = document.querySelector(".bar-stone-counter").children;

    for (let square = 0; square < 49; square++) {
        let barSquare = barSquares[square];

        barSquare.classList = "";

        if (square == 24) {
            barSquare.classList.add("bar-stone-counter-halfway-mark");
        }

        if (square < counter["white"]) {
            barSquare.classList.add("bar-stone-counter-white");
        } else if (square >= 49 - counter["black"]) {
            barSquare.classList.add("bar-stone-counter-black");
        } else {
            barSquare.classList.add("bar-stone-counter-blank");
        }
    }
}

module.exports = {updateCounters};