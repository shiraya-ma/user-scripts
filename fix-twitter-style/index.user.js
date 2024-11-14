// ==UserScript==
// @name         Fix Twitter Style
// @namespace    https://www.shiraya.ma/
// @version      2024-11-15
// @updateURL    https://github.com/shiraya-ma/user-scripts/raw/refs/heads/main/fix-twitter-style/index.user.js
// @description  Fix style for little css bugs.
// @author       https://x.com/shiraya_ma
// @match        https://x.com/*
// @icon         https://www.shiraya.ma/favicon.ico
// @grant        none
// ==/UserScript==

(d => {
    /** @type { NavigatorUAData | undefined } */
    const userAgentData = window.navigator.userAgentData;

    if (!userAgentData) {
        return;
    }

    const chromiumRegexp = /^(Chromium||(Google Chrome))$/;

    const chrome = userAgentData.brands.find(brand => chromiumRegexp.test(brand.brand));

    if (!chrome) {
        return;
    }

    d.documentElement.setAttribute('data-chromium-version', chrome.version);

    const TARGET_VERSIONS = [
        '131'
    ];

    const style = d.createElement('style');

    const selectors = TARGET_VERSIONS.map(ver => `html[data-chromium-version='${ ver }'] div > .public-DraftStyleDefault-block::selection`);

    style.innerHTML = `${selectors.join(',\n')} {\n\tbackground: #72bfb5 !important;\n}`;

    d.head.appendChild(style);
})(document);

/**
 * @typedef { Object } NavigatorUAData
 * @prop { Brand[] } NavigatorUAData.brands
 * @prop { boolean } NavigatorUAData.mobile
 * @prop { string } NavigatorUAData.platform
 *
 * @typedef { Object } Brand
 * @prop { string } Brand.brand,
 * @prop { string } Brand.version
 */
