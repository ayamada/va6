# va6 Developer note

## Usage

```
npm i # or `npm ci` for build only
npm run dev
open http://localhost:8001/demo/dev.html
```

## TODO


- playingstate.jsを完成させよう
    - 一応できた(動作未確認)
    - debug()を、playingstate.jsを叩くようにしよう



- nodeset.js を分離する
    - あとからfaderNodeとか追加しやすいように
        - faderNodeは今は追加しないがTODOとして書いておく事



- どこから進めていくか決める必要がある
    - 動作確認の取れる部位から進めなくてはならない




- package.json のメンテ
    - va5の Makefile 等を見ながら、npm run に移植していく
        - 同時にドキュメント等も整備する事


- asp回り？



- va6/config の各項目の実装
    - 他namespaceの実装と共に増やす想定






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



- asp(audio-source-parameter)モジュールの実装
    - これまで引数として渡していた {path:"hoge.m4a"} みたいな奴の仕様化
    - また、pathを持たないasの為の仕様の明確化(WebAudioインスタンスから直生成したas、他)
        - 具体的には、各asを区別する為のidがpath以外にあればok
    - もっと後の方がいいのでは？
    - つまり要件としては「va5で言うところのaudioSource」を生成できるパラメータ、という事なのだけど、今回は「oacを使ってon the flyに生成したSE音源」などもあるので、それらもこのaspで表現できないといけないので、もうちょっと内部カテゴリがふくらむ感じ
        - とりあえず、volumeとかpanとかの再生用パラメータと、pathのようなsourceに関わるパラメータを分けるべきでは？
            - ただし、外側から呼び出す時はまとめたい…
            - いい方法ある？
            - 分けなくてもいいと思う。なぜなら基本的に全てのパラメータは再生用であり、「元音源を指定するパラメータ」も再生用だから。そしてこれは `path` と `arrayBuffer` の二つがあれば十分なので。
                - on the flyにSE等を生成する場合は、生成側で `arrayBuffer` の形にまで作る、というルールで運用する。AudioContextのグラフ構造のまま渡す事はできない、というルールならこれで機能する








