// ==UserScript==
// @name         Fix date to Locale Date Format on TSS WAR THUNDER
// @namespace    http://tampermonkey.net/
// @version      v0.0.1
// @updateURL    https://github.com/shiraya-ma/user-scripts/raw/refs/heads/main/fix-date-tss-warthunder/index.user.js
// @description  try to take over the world!
// @author       You
// @match        https://tss.warthunder.com/index.php
// @include       /^https://tss.warthunder.com/index.php*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=warthunder.com
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const action = getAction();

  switch (action) {
    case 'current_tournaments': {
      actionCurrentTournaments();
      return;
    }
    case 'tournament': {
      return;
    }
    default: {
      console.log('unknown action:', action);
      return;
    }
  }
})();

/**
 *
 * @returns { Action | null }
 */
function getAction () {
  const url = new URL(window.location.href);
  const sp = url.searchParams;
  const action = sp.get('action');
  return action;
};

/**
 * @typedef { 'current_tournaments' | 'tournament'} Action
 */

function actionCurrentTournaments () {
  waitRenderContentCardTournament((container) => {
    console.log('found container:', container);

    waitRenderTournamentDate(container, (card => {
      console.debug(card);

      const tournamentDate = card.querySelector('p[data-original-title="Tournament Date"]');
      console.debug('tournamentDate:', tournamentDate);
      const [ initStartDate, initEndDate ] = tournamentDate.textContent.split(/\s-\s/);
      console.debug('initStartDate:', initStartDate, ', initEndDate:', initEndDate);

      const startDate = new Date(initStartDate);
      const endDate = new Date(initEndDate);

      tournamentDate.textContent = `${fixDateFormat(startDate)} - ${fixDateFormat(endDate)}`
      console.debug('startDate:', startDate, ', endDate:', endDate);
    }));
  });
};

/**
 *
 * @param { (container: HTMLDivElement) => void } callback
 */
async function waitRenderContentCardTournament (callback) {
  const selector = 'div#contentCardTournament';

  const container = document.querySelector(selector);
  if (container) {
    callback(container);
    return;
  }

  const observer = new MutationObserver(() => {
    const container = document.querySelector(selector);
    console.log('search container:', container);
    if (!container) return;

    observer.disconnect();
    callback(container);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

/**
 *
 * @param { HTMLDivElement } container
 * @param { (card: HTMLDivElement) => void } callback
 */
async function waitRenderTournamentDate (container, callback) {
  const selector = 'div[card-name="tornamentStatus"]';

  const cards = container.querySelectorAll(selector);
  if (cards.length > 0) {
    cards.forEach(callback);
    return;
  }

  const observer = new MutationObserver(() => {
    const cards = container.querySelectorAll(selector);
    console.log('search cards:', cards);
    if (!cards || cards.length < 1) return;

    observer.disconnect();
    cards.forEach(callback);
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
  });
};

/**
 *
 * @param { Date } date
 */
function fixDateFormat (date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart('0', 2);
  const dd = String(date.getDate()).padStart('0', 2);

  const H = date.getHours();
  const MM =String(date.getMinutes()).padStart('0', 2);

  return `${yyyy}/${mm}/${dd} ${H}:${MM}`;
}
