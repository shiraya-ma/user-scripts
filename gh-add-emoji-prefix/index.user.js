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

  onOpenCommitSuggestionModal((input) => {
    console.log('commit suggestion input found:', input);
    const originalValue = input.value;

    if (/^:\w+:\s/.test(originalValue)) {
      return;
    }
    
    input.value = `:recycle: ${originalValue}`;
    console.log('updated commit suggestion message:', input.value);
  });

  onOpenMergePullRequestModal((input) => {
    console.log('merge pull request input found:', input);
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
  /**
   * 
   * @param {HTMLInputElement} input 
   * @returns {boolean}
   */
  const isShown = (input) => input.getAttribute('gh-add-emoji-prefix-shown') === 'true';

  /**
   * 
   * @param {HTMLInputElement} input 
   * @param {boolean} shown 
   */
  const toggleShown = (input, shown) => {
    input.setAttribute('gh-add-emoji-prefix-shown', shown ? 'true' : 'false');
  };

  const observer = new MutationObserver(() => {
    /** @type { HTMLInputElement | null } */
    const input = document.querySelector('div.merge-pr input');

    if (!input || isShown(input)) return;

    toggleShown(input, true);

    callback(input);
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

/**
 * 
 * @param {OnOpenCallback} callback 
 */
function onOpenCommitSuggestionModal (callback) {
  /**
   * @param {HTMLElement} details 
   * @returns {boolean}
   */
  const isOpen = (details) => details.hasAttribute('open');

  const detailsListObserver = new MutationObserver(() => {
    /** @type { NodeListOf<HTMLElement> } */
    const details = document.querySelectorAll('details.js-apply-single-suggestion');

    if (details.length > 0) {
      console.log('details found, disconnecting observer');
      detailsListObserver.disconnect();
    }

    details.forEach((details) => {
      const detailsObserver = new MutationObserver(() => {
        if (!isOpen(details)) return;

        const input = details.querySelector('form.js-single-suggested-change-form input[name="commit_title"]');

        if (!input) return;

        callback(input);
      });

      detailsObserver.observe(details, { attributes: true, attributeFilter: ['open'] });
    });
  });

  detailsListObserver.observe(document.body, { childList: true, subtree: true });
};

/**
 * @typedef { (input: HTMLInputElement) => void } OnOpenCallback
 */
