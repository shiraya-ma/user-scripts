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
Twitterのページを開いた状態で[Ctrl] + [Alt] + [C]を同時押しすると、
クリップボードにはvxtwitter.comに変換されたURLがコピーされます。

### 右クリックメニュー
Twitterのページ上で右クリックをして、
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
// @version         0.1.1
// @description     Copy the URL with the domain replaced by "vxtwitter.com" to the clipboard.
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

    GM_registerMenuCommand('Discord用URLをコピー', onClickContextmenu(fixedUrl));

    document.addEventListener('keydown', onKeydownListener(fixedUrl));
})();

/**
 * 与えられた文字列をクリップボードへコピーする関数
 */
function copy2Clipboard (text: string): void {
    try {
        GM_setClipboard(text, "text");

        alert (`コピーしました。\n${ text }`);
    } catch (e) {
        alert (`コピーに失敗しました。${ text }`);
        console.error(e);
    }
}

/**
 * 与えられた相対パスとベースURLから修正後のURLを返す関数
 */
function fixURL (relativePath: string, baseUrl: string): string {
    const fixedUrl = new URL(relativePath, baseUrl);

    return fixedUrl.href;
}

/**
 * コンテキストメニューがクリックのリスナー
 */
function onClickContextmenu (text: string) {
    const listener = () => {
        copy2Clipboard(text)
    };

    return listener;
}

/**
 * タブ内のホットキーを定義するリスナー
 */
function onKeydownListener (text: string) {
    const listener = (ev: KeyboardEvent) => {
        if (ev.ctrlKey && ev.altKey && ev.key === 'c') {
            ev.preventDefault();
    
            copy2Clipboard(text);
        }

    };

    return listener;
}

/**
 * 与えられたurlの相対パスを返す関数
 */
function removeOrigin (url: string): string {
    const _url = new URL(url);
    const origin = _url.origin;

    return url.replace(origin, '');
}