# va6 Developer note

## Usage

```
npm i # or `npm ci` for build only
npm run dev
open http://localhost:8001/demo/dev.html
```

## TODO




- 音量フェーダーをどこに入れるか
    - とりあえずva5を確認する事！！！！優先！
    - ...
    - ...
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











