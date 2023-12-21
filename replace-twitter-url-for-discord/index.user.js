"use strict";
/*
# Discord用URLをコピーするユーザースクリプト

## 目次
* Discord用URLをコピーするユーザースクリプト
    * 目次
    * はじめに
    * 使い方
        * ショートカットキー
        * 右クリックメニュー
    * 不具合

## はじめに
数ヶ月前のTwitterの仕様変更で、Discordにカード表示がされなくなってしまい、
いちいちvxtwitter.comとかに変えるのが面倒くさいのでスクリプトを書きました。
(詳しくはTwitter CardとかOGPとかでググるといいと思います。)

## 使い方

### ショートカットキー
Twitterで誰かのツイートを開いた状態で[Ctrl] + [Alt] + [C]を同時押しすると、
クリップボードにはvxtwitter.comに変換されたURLがコピーされます。

### 右クリックメニュー
Twitterで誰かのツイートを開いた状態でページ上を右クリックをして、
Tampermonkey > Discord用URLをコピーとクリックすると、
クリップボードにはvxtwitter.comに変換されたURLがコピーされます。

## 不具合
簡単なスクリプトなのでないと思いますが、
バグとかあったらDiscordとかTwitterで教えてください。

できる範囲で直します。
*/
// ==UserScript==
// @name            Discord用URLをコピー
// @namespace       https://twitter.com/mai_shirayama
// @version         1.0.3
// @description     Copy the URL with the domain replaced by "vxtwitter.com" to the clipboard.
// @icon            https://github.com/shirayama-mai/user-scripts/raw/main/replace-twitter-url-for-discord/icon.png
// @author          @mai_shirayama
// @match           https://x.com/*
// @match           https://twitter.com/*
// @grant           GM_setClipboard
// @grant           GM_registerMenuCommand
// @run-at          document-idle
// @updateURL       https://github.com/shirayama-mai/user-scripts/raw/main/replace-twitter-url-for-discord/index.user.js
// @downloadURL     https://github.com/shirayama-mai/user-scripts/raw/main/replace-twitter-url-for-discord/index.user.js
// @noframes
// ==/UserScript==
(() => {
    'use strict';
    const BASE_URL = 'https://vxtwitter.com/';
    const url = window.location.href;
    const relativePath = removeOrigin(url);
    const fixedUrl = fixURL(relativePath, BASE_URL);
    GM_registerMenuCommand('Discord用URLをコピー', onClickContextmenu);
    document.addEventListener('keydown', onKeydownListener);
})();
/**
 * 与えられた文字列をクリップボードへコピーする関数
 */
function copy2Clipboard(text) {
    try {
        GM_setClipboard(text, "text");
        alert(`コピーしました。\n${text}`);
    }
    catch (e) {
        alert(`コピーに失敗しました。${text}`);
        console.error(e);
    }
}
/**
 * 与えられた相対パスとベースURLから修正後のURLを返す関数
 */
function fixURL(relativePath, baseUrl) {
    const fixedUrl = new URL(relativePath, baseUrl);
    return fixedUrl.href;
}
function getFixedURL() {
    const BASE_URL = 'https://vxtwitter.com/';
    const url = window.location.href;
    if (!/\/status\//.test(url)) {
        return undefined;
    }
    const relativePath = removeOrigin(url);
    const fixedUrl = fixURL(relativePath, BASE_URL);
    return fixedUrl;
}
/**
 * コンテキストメニューがクリックのリスナー
 */
function onClickContextmenu() {
    const fixedUrl = getFixedURL();
    if (fixedUrl) {
        copy2Clipboard(fixedUrl);
    }
}
/**
 * タブ内のホットキーを定義するリスナー
 */
function onKeydownListener(ev) {
    const fixedUrl = getFixedURL();
    if (fixedUrl && ev.ctrlKey && ev.altKey && ev.key === 'c') {
        ev.preventDefault();
        copy2Clipboard(fixedUrl);
    }
}
/**
 * 与えられたurlの相対パスを返す関数
 */
function removeOrigin(url) {
    const _url = new URL(url);
    const origin = _url.origin;
    return url.replace(origin, '');
}
