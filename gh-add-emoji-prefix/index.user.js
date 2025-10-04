// ==UserScript==
// @name         Add Emoji Prefix on PR
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Adds an emoji prefix to the merge commit message on GitHub pull requests.
// @author       @shiraya-ma
// @match        https://github.com/*/*/pull/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(() => {
  'use strict';
  const EMOJI_PREFIX_REGEX = /^:\w+:\s/;

  onOpenCommitSuggestionModal((input) => {
    console.log('commit suggestion input found:', input);
    const originalValue = input.value;

    const SUGGESTION_PREFIX = ':recycle:';

    if (EMOJI_PREFIX_REGEX.test(originalValue)) {
      return;
    }
    
    input.value = `${SUGGESTION_PREFIX} ${originalValue}`;
    console.log('updated commit suggestion message:', input.value);
  });

  onOpenMergePullRequestModal((input) => {
    console.log('merge pull request input found:', input);
    const originalValue = input.value;

    const MERGE_EMOJI_PREFIX = ':twisted_rightwards_arrows:';

    if (EMOJI_PREFIX_REGEX.test(originalValue)) {
      return;
    }

    input.value = `${MERGE_EMOJI_PREFIX} ${originalValue}`;
    console.log('updated merge message:', input.value);
  });
})();

/**
 * Observes for the GitHub merge modal and executes a callback when it appears.
 * @param {OnOpenCallback} callback 
 */
function onOpenMergePullRequestModal (callback) {
  /**
   * Checks if the emoji prefix has already been added to the input.
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
 * Observes for the GitHub commit suggestion modal and executes a callback when it appears.
 * @param {OnOpenCallback} callback 
 */
function onOpenCommitSuggestionModal (callback) {
  /**
   * @param {HTMLElement} details 
   * @returns {boolean}
   */
  const isOpen = (details) => details.hasAttribute('open');

  /**
   * @param {HTMLElement} details 
   * @returns {boolean}
   */
  const isObserved = (details) => details.getAttribute('gh-add-emoji-prefix-observed') === 'true';

  /**
   * @param {HTMLElement} details 
   * @param {true} observed 
   */
  const toggleObserved = (details, observed) => {
    details.setAttribute('gh-add-emoji-prefix-observed', observed ? 'true' : 'false');
  }

  const detailsListObserver = new MutationObserver(() => {
    /** @type { NodeListOf<HTMLElement> } */
    const details = document.querySelectorAll('details.js-apply-single-suggestion');

    details
    .filter((details) => !isObserved(details))
    .forEach((details) => {
      toggleObserved(details, true);

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
