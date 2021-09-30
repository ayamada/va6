# va6 Developer note

## Usage

```
npm i # or `npm ci` for build only
(TODO)
npx http-server -a 127.0.0.1 ./ -p 8001
open http://localhost:8001/demo/dev.html
```

## 新案

方針

- ある程度単純なSEはon the flyに生成するようにしたい
    - 将来的にはBGMもMMLっぽい何かから生成したい
    - よって、WebAudio叩きでこれらを(鳴らさずに)生成する手順を調べたい

- 上記の際に想定される問題点として、「WebAudioのアクティベーションどうするか問題」がある
    - chrome的には「context生成してからイベントリスナでresumeする」ではなく「イベントリスナでcontext生成する」方にしてほしいようで、前者だと警告が出る。しかし前者にしないとイベント発生前に生成しておく事ができないのでは？
    - OfflineAudioContext を使えばいいらしい
        - https://developer.mozilla.org/ja/docs/Web/API/OfflineAudioContext
        - https://taku-o.hatenablog.jp/entry/20190118/1547825938
        - https://taku-o.hatenablog.jp/entry/2019/02/24/203545
        - https://mohayonao.hatenablog.com/entry/2014/10/21/201351
            - これがわかりやすい
        - https://developer.mozilla.org/ja/docs/Web/API/BaseAudioContext/createBuffer
            - ノイズ音源を作るサンプル。AudioBufferを作り、直接中の値をいじる事で、OfflineAudioContextを使わずに音源を作成している
        - https://ics.media/entry/200427/
            - オシレータを作ってconnectして鳴らすサンプル。今回はオシレータやlfoを多用する想定なので、必要に応じて見る事
    - WebAudio関連のiOS Safariでの対応はvendor prefix付きなので注意(最近取れたらしい)。OfflineAudioContextも同じ



どこからやるか

- まず最初に、dev.htmlベースで開発できる環境まで作る
    - できた
    - 次に、ユーザー操作を監視してAudioContextを生成するところを実装
    - 次に、できてるAudioContextをPromiseで返すやつと、状態を見れる関数を実装
    - 次に、OfflineAudioContextの提供


## 一時メモ

- https://qiita.com/zprodev/items/7fcd8335d7e8e613a01f


## 未整理




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

- プラグインの実装
    - プラグインとしてoggのwasmとかを追加できるようにしたい

- asp(audio-source-parameter)モジュールの実装
    - これまで引数として渡していた {path:"hoge.m4a"} みたいな奴の仕様化
    - また、pathを持たないasの為の仕様の明確化(WebAudioインスタンスから直生成したas、他)
        - 具体的には、各asを区別する為のidがpath以外にあればok
    - もっと後の方がいいのでは？








