# va6 Developer note

期間が空いてしまったので、一旦仕切り直す。








以下は古いもの

## Usage

```
npm i # or `npm ci` for build only
npm run dev
open http://localhost:8001/demo/dev.html
```

## TODO


より良いexportのやり方は以下らしい。今はdefaultの方を設定していないので、設定するようにしたい

```
var hoge = {...};
module.exports = hoge; // require('hello-world-script')できるようにする
module.exports.default = hoge; // import xxx from 'hello-world-script'できるようにする
```

- とりあえずinterface側から掘り進めるしかないと思う
    - その流れで、manager部を実装する形になると思う
    - どこかにva5の旧interfaceで、まだ未実装なものの一覧を書いた筈だけど…



- 目下の中間目標は「BGMプレイヤー」
    - 自分の好きなBGMを全自動で適切なタイミングで再生/停止するやつ
    - 候補のBGMは自分が過去に集めた奴の中から選択
        - 簡易データベースを作る必要がある
    - 自分がコンソール作業をしている時だけ再生。コンソールが一定時間放置されたら非常にゆっくりボリュームを小さくし、停止する。コンソールが再開したらまた再生
        - どうやってコンソールの監視を行う？
            - tmuxにそういう機能がないか探す
            - tmuxで、カレントバッファに変動があったら特定ファイルをtouchする設定を行えば、あとはそのファイルのタイムスタンプを見れば監視できる
                - 問題は誤判定の可能性がある事。例えばmのscreenの時計部分とか
                    - mのscreenの時計部分は「カレントバッファ以外は見ない」事にすれば対応可能。でもそれ以外にも誤判定の要因はありそう
    - 実装は可能ならnodeにしたいが…
        - おそらく厳しい。electronかpuppeteerでないと駄目な気がする
        - ちょっと調べた。できそう？
            - 基本的には、一時ファイルに書き出してnativeの再生コマンドに渡すしかないようだ
                - macでは `afplay` コマンドとの事
                - https://github.com/futomi/node-wav-player がそれをやってくれる(mac以外でも)
    - このプレイヤーの名前を決める必要がある
        - tmp-player - うーん
        - bgm-player - うーん
        - bgm-manager
        - live-player
        - 基本的には「自分が部屋にいる」「寝てないで活動している」「音系作業をしていない」時に勝に流してほしいやつ、という事なので、この性質を示した名前にするのが望ましい
            - 生存確認？
            - あるいは「居るときだけプレイヤー」的な…
        - alive-player - 生存確認は英語だと `Hey, you alive?` との事
        - there-player - 英語だと `Are you there?` とも言うらしいので
        - work-player - こういう系統にするしかない？
        - env-player - 方向性としては悪くはないのだが…
        - away-player - 意味としては逆だが通じるとは思う
        - ...
        - ...
        - ...
        - ...
        - ...
    - va6内に別ディレクトリを掘って開発しましょう
        - ...



以下は古いメモ



- 音量フェーダーをどこに入れるか
    - とりあえずva5を確認する事！！！！優先！
        - 調べた。フェード要求がある時だけgoスレッドを起動し、stateを参照しつつ50msec毎にボリュームを変更していく実装だった
    - AudioParamのスケジューラを使えないか調べてみたが、非対応が多く難しい感じだった
        - https://developer.mozilla.org/ja/docs/Web/API/AudioParam
        - 具体的には、firefoxで未実装だったりバグで正常に動かない状態のものばかり
            - linearRampToValueAtTime を本当は使いたいのだけど、firefoxではバグで動かない
            - cancelAndHoldAtTime を本当は使いたいのだけど、firefoxでは未対応
    - ...
    - ...



- se完成させましょう
    - playProtoからどう進める？
        - 連打防止？
        - チャンネル管理？
        - namespace分離？
            - おそらく、これを先にするのがよいのでは？


- playBuf相当ができた。ここから次はどうする？
    - まずplayBufだけで成り立つ実装にし、その後でcache回りを作っていきたい
    - bufロード？
    - cacheマネージャ？
        - プリロード(ダウンロードのみ)
        - デコード(プラグイン設定あり)
        - アンロード
        - キャッシュ設定
            - キャッシュ数
            - 自動アンロード設定
            - ...
    - oacユーティリティ？
        - 単音生成ユーティリティ
        - 既存のbufを適切に合成するやつ
    - seマネージャ？
        - まず単発再生だけでいけるseから手をつける
    - bgmマネージャ？
    - voiceマネージャ？(内部的にはoneshotのbgmとほぼ同じ)
    - ...
    - ...
    - ...
    - ...







- va6/config の各項目の実装
    - 他namespaceの実装と共に増やす想定



- package.json のメンテ
    - va5の Makefile 等を見ながら、npm run に移植していく
        - 同時にドキュメント等も整備する事












- oacを使い、ある程度の単純なBGM/SEをon the flyに生成するテストを実装
    - 以下は資料url
        - https://developer.mozilla.org/ja/docs/Web/API/OfflineAudioContext
        - https://taku-o.hatenablog.jp/entry/20190118/1547825938
        - https://taku-o.hatenablog.jp/entry/2019/02/24/203545
        - https://mohayonao.hatenablog.com/entry/2014/10/21/201351
            - これがわかりやすい
        - https://developer.mozilla.org/ja/docs/Web/API/BaseAudioContext/createBuffer
                - ノイズ音源を作るサンプル。AudioBufferを作り、直接中の値をいじる事で、OfflineAudioContextを使わずに音源を作成している
            - https://ics.media/entry/200427/
                - オシレータを作ってconnectして鳴らすサンプル。今回はオシレータやlfoを多用する想定なので、必要に応じて見る事
    - 実際の実装としては、以下がある
        - https://github.com/loov/jsfx/blob/master/jsfx.js



## 一時メモ


- https://qiita.com/zprodev/items/7fcd8335d7e8e613a01f
    - 音源のunload処理は、ここを見て実装する事




## 未整理メモ



- プリロード機能の提供
    - pathを引数に取り、xhrでファイルを取得し、内容を返す奴
    - 純粋なプリロードのみであれば、取得したファイルを使う必要はない
    - va5以前とは違い、この段階ではまだdecodeは行わない(decodeには通常WebAudioインスタンスが必要となり、これがアンロックされる前はdecodeできない為)
    - ファイル内容のキャッシュをjsランドで行う事はしないが、ブラウザランドやxhrランドでのキャッシュは有効にしたい。



- デコードプラグインの実装
    - プラグインとしてoggのwasmとかを追加できるようにしたい
    - 今のところプラグインが必要なのはデコードのみ？
    - 各デコーダのjs実装は、audiocogsが昔に作っていた奴が色々あるようだ
        - https://github.com/audiocogs











