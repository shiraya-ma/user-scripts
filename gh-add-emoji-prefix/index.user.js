// ==UserScript==
// @name         Add Emoji Prefix on PR
// @namespace    http://tampermonkey.net/
// @version      1.0.0-alpha
// @description  Adds an emoji prefix to the merge commit message on GitHub pull requests.
// @author       @shiraya-ma
// @match        https://github.com/*/*/pull/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  onOpenMergePullRequestModal((input) => {
    const originalValue = input.value;

    if (/^:\w+:\s/.test(originalValue)) {
      return;
    }

    input.value = `:twisted_rightwards_arrows: ${originalValue}`;

    console.log('updated merge message:', input.value);
  });
})();

/**
 * Observes for the GitHub merge modal and executes a callback when it appears.
 * @param {OnOpenCallback} callback 
 */
function onOpenMergePullRequestModal (callback) {
  let shown = false;

  const observer = new MutationObserver(() => {
    /** @type { HTMLInputElement | null } */
    const input = document.querySelector('div.merge-pr input');

    if (!input) {
      shown = false;
      return;
    }

    if (!shown) {
      shown = true;
      callback(input);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

/**
 * @typedef { (input: HTMLInputElement) => void } OnOpenCallback
 */
