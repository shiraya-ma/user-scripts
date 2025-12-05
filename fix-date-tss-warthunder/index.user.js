// ==UserScript==
// @name         Fix date to Locale Date Format on TSS WAR THUNDER
// @namespace    http://tampermonkey.net/
// @version      v0.1.0
// @updateURL    https://github.com/shiraya-ma/user-scripts/raw/refs/heads/main/fix-date-tss-warthunder/index.user.js
// @downloadURL  https://github.com/shiraya-ma/user-scripts/raw/refs/heads/main/fix-date-tss-warthunder/index.user.js
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
      actionTournament();
      return;
    }
    case 'my_tournaments': {
      actionMyTournaments();
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

// ##############################
// current_tournaments
// ##############################

/**
 * @typedef { 'current_tournaments' | 'tournament' | 'my_tournaments' } Action
 */

function actionCurrentTournaments () {
  observeOnce('div#contentCardTournament', (container) => {
    // Tournament Date
    observesOnce('div[card-name="tornamentStatus"]', (card) => {
      observeOnce('p[data-original-title="Tournament Date"]', fixDuration, card);
    }, container);    
  });
};

// ##############################
// tournament
// ##############################

function actionTournament () {
  observeOnce('div#time_tournament_about', (about) => {
    // Registration ending and tournament bracket generation
    observeOnce('div#time_tournament_about', fixDate, about);

    // Play-off
    observesOnce('div[name="tournament_time_all"]', (round) => {
      observeOnce('div[name="time_tour"]', fixDate, round);
    }, about);
  });
};

// ##############################
// my_tournaments
// ##############################

function actionMyTournaments () {
  observeOnce('div#contentCardMyTournament', (contentCardMyTournament) => {
    observesOnce('div[card-name="tornamentStatus"] > div.row', (tornamentStatus) => {
      observeOnce('p[card-name="dayTournament"]', fixDuration, tornamentStatus);
    } ,contentCardMyTournament);
  });
};

/**
 * 
 * @param {string} selector 
 * @param {(target: HTMLElement) => void} callback 
 * @param { HTMLElement | undefined } container 
 */
function observeOnce (selector, callback, container) {
  const _container = container ?? document.body;

  console.group(selector);

  console.debug('seach...');

  const target = _container.querySelector(selector);
  if (target) {
    console.debug('sync find:', target);
    callback(target);
    console.groupEnd();
    return;
  }

  const observer = new MutationObserver(() => {
    const target = _container.querySelector(selector);
    if (!target) return;

    console.debug('async find:', target);
    observer.disconnect();
    callback(target);
    console.groupEnd();
  });

  observer.observe(_container, {
    childList: true,
    subtree: true,
  });
};

/**
 * 
 * @param {string} selector 
 * @param {(target: HTMLElement) => void} callback 
 * @param { HTMLElement | undefined } container 
 */
function observesOnce (selector, callback, container) {
  const _container = container ?? document.body;

  console.group(selector);

  console.debug('seach...');

  const targets = _container.querySelectorAll(selector);
  if (targets.length) {
    console.debug('sync find:', targets);
    targets.forEach(callback);
    console.groupEnd();
    return;
  }

  const observer = new MutationObserver(() => {
    const targets = _container.querySelectorAll(selector);
    if (!targets.length) return;

    console.debug('async find:', targets);
    observer.disconnect();
    targets.forEach(callback);
    console.groupEnd();
  });

  observer.observe(_container, {
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

/**
 * 
 * @param { HTMLElement } element 
 */
function fixDate (element) {
  const init = new Date(element.textContent);
  element.textContent = String(fixDateFormat(init));
};

/**
 * 
 * @param { HTMLElement } element 
 */
function fixDuration (element) {
  const [ initStartDate, initEndDate ] = element.textContent.split(/\s-\s/).map(text => new Date(text));
  element.textContent = `${fixDateFormat(initStartDate)} - ${fixDateFormat(initEndDate)}`;
};
