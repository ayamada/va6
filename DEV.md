# va6 Developer note

## 

```
(TODO)
npx http-server -a 127.0.0.1 ./ -p 8001
open http://localhost:8001/demo/dev.html
```

## 未整理

まず最初に、dev.htmlベースで開発できる環境まで作る



- package.json のメンテ

- Makefile のメンテ


chromeで、以下のwarningが出ないようにする
https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio

- addEventHandlerでのアンロックの実装




- WebAudioインスタンスへの以下の二つのアクセサの提供
    - アンロック前はnilを返す、非asyncなアクセサ
    - Promiseを返す、asyncなアクセサ



- プリロード機能の提供
    - pathを引数に取り、xhrでファイルを取得し、内容を返す奴
    - 純粋なプリロードのみであれば、取得したファイルを使う必要はない
    - va5以前とは違い、この段階ではまだdecodeは行わない(decodeには通常WebAudioインスタンスが必要となり、これがアンロックされる前はdecodeできない為)
    - ファイル内容のキャッシュをjsランドで行う事はしないが、ブラウザランドやxhrランドでのキャッシュは有効にしたい。

- asp(audio-source-parameter)モジュールの実装
    - これまで引数として渡していた {path:"hoge.m4a"} みたいな奴の仕様化
    - もっと後の方がいいのでは？








