// ==UserScript==
// @name         Mindforge VGuess - P/W
// @namespace    jkhsjdhjs
// @author       jkhsjdhjs & GottZ
// @description  Adds a column to the vguess ranking table showing the average points per win for each user.
// @include      https://mindforge.org/*/vguess/*
// @version      1.0.0
// @updateURL    https://github.com/GoldenSpaceCat/mindforge.org-vguess/raw/master/vguess.user.js
// @downloadURL  https://github.com/GoldenSpaceCat/mindforge.org-vguess/raw/master/vguess.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    "use strict";

    // magical helper wrapping around document.createElement
    const ce = (tag, opts) => {
        const node = document.createElement(tag);
        if (!opts) return node;
        for (let key in opts) {
            if (key == "parent" || key == "style") continue;
            node[key] = opts[key];
        }
        if (opts.parent) {
            opts.parent.appendChild(node);
        }
        if (opts.style) {
            Object.keys(opts.style).map(key => node.style[key] = opts.style[key]);
        }
        return node;
    };

    // some browsers don't support console unless dev tools are attached.
    const console = window.console || {log:()=>{}};

    const columnLocales = {
        "de": "Punkte/Sieg",
        "en": "Points/Win",
        "es": "Puntos/Ganada",
        "fr": "Points/Gagne",
        "it": "Punti/Vittoria",
        "pl": "Punkty/Wygrana",
        "pt": "Pontuação/Ganhos"
    };

    // grab required DOM nodes
    const table = document.querySelector(".entry > center > table");
    const header = table.querySelector("tr");
    // grab data rows only
    const rows = [...table.querySelectorAll("tr:not(:first-child)")];

    // create title button
    const sortButton = ce("a", {
        parent: ce("th", {parent: header}),
        href: "#",
        textContent: columnLocales[location.pathname.match(/^\/([a-z]{2})\//)[1]]
    });

    // use requestAnimationFrame to prevent multi draw (wich could slow things down)
    // and attach calculated values to each row
    window.requestAnimationFrame(() => {
        rows.forEach(tr => {
            const td = tr.querySelectorAll("td");
            const value = (td[2].textContent / td[3].textContent);
            // attach value as floating point to tr for better sorting
            tr.value = value;
            ce("td", {
                parent: tr,
                textContent: value.toFixed(2)
            });
        });
    });

    let sortDirection = false;

    // sort handling
    sortButton.addEventListener("click", e => {
        // prevent further events and browser navigation
        e.preventDefault();
        e.stopPropagation();

        // prevent multi draw to ensure 60 fps
        window.requestAnimationFrame(() => {
            // remove all rows from table for re sorting
            rows.map(tr => {
                tr.parentNode.removeChild(tr);
            });

            // sort rows based on value and direction
            rows.sort((a, b) => {
                // sort based on tr.value
                a = a.value;
                b = b.value;
                return sortDirection ? a - b : b - a;
            // append rows to table
            }).map(tr => table.appendChild(tr));

            // inverse sort direction for next sorting
            sortDirection = !sortDirection;
        });
    });
})();