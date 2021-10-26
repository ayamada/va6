(function (global, factory) {
  var namespace = 'va6/se';
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global[namespace] = {}));
}(this, (function (exports) { 'use strict';

  var root = {};
  if (typeof window !== 'undefined') { root = window; }
  else if (typeof global !== 'undefined') { root = global; }
  function importLoadedModule (namespace) {
    var m = root[namespace];
    if (!m) { throw new Error(namespace + " not found"); }
    return m;
  }


  var log = importLoadedModule('va6/log');
  var validate = importLoadedModule('va6/validate');
  var config = importLoadedModule('va6/config');
  var webaudio = importLoadedModule('va6/webaudio');
  var nodeset = importLoadedModule('va6/nodeset');
  var playingstate = importLoadedModule('va6/playingstate');
  var playarg = importLoadedModule('va6/playarg');



  // TODO: この処理はSEのみならずBGM/VOICEでも共通なので、別のところに移動させる事。しかしその為には「ChannelData」をより共通化させる必要がある。channeldata.jsに分けるか？
  function playChannelData (cd) {
    var ac = exports.getAudioContext();
    // NB: ここに来た段階で、cd.bufが解決できている前提
    var ps = playingstate.make(cd.buf);

    // TODO: se-chattering-sec(旧名)のチェック
    // TODO: まず先にconfig項目をどうにかする

    // NB: cd.params.channel への対応が必要だが、ここでは行わない
    // TODO: cd.params.fadeinSec への対応。そもそもフェードインアウトをどう実装するかという問題がある…。でもとりあえずfadeinSecや0でないなら音量は0スタートになるので、0をセットしておきたい
    // NB: cd.params.transitionMode への対応は、seでは不要(bgm/voiceでは必要)
    // NB: cd.params.isAlarm への対応はここでは不要

    // TODO: volume-se(旧名)の適用
    // TODO: まず先にconfig項目をどうにかする

    playingstate.setVolume(ps, cd.params.volume);
    playingstate.setPan(ps, cd.params.pan);
    playingstate.setPitch(ps, cd.params.pitch);
    playingstate.setPos(ps, cd.params.pos);
    playingstate.setLoopStartPos(ps, cd.params.loopStartPos);
    playingstate.setEndPos(ps, cd.params.endPos);
    //playingstate.setEndedHandle(ps, endedHandle); // TODO: 不明

    playingstate.play(ps);
  }


  function seProto (params) {
    var ac = exports.getAudioContext();
    if (!ac) { return; }

    params = playarg.normalize("se", params);
    if (!params) { return; }

    // TODO: pathとbuiltinへの対応を実装しましょう
    // TODO: pathとbuiltinはこの時点(ロード前)にchanを返す必要がある
    // TODO: この辺りの処理を上手く抽象化し、bgm/se/voiceで共通化したい

    if (params.path != null) {
      log.error(["'path' is not implemented yet", params]);
      return;
    }
    if (params.builtin != null) {
      log.error(["'builtin' is not implemented yet", params]);
      return;
    }

    // bufが解決できたら、channelDataの形にしてplayChannelDataに行ける
    // (今はpathやbuiltin非対応なのでそのまま行けるが、将来はasyncになる)
    var channelData = {
      buf: params.buf,
      params: params
    };
    playChannelData(channelData);

    // TODO: 内部で保持しているchannelDataを参照できるようにする

    // TODO: channelDataを参照できる、channel文字列を返す必要がある
    return "TODO";
  }



  exports.play = function (xxx) {
    // TODO
  };

  exports.stop = function (xxx) {
    // TODO
  };




  Object.defineProperty(exports, '__esModule', { value: true });
})));
