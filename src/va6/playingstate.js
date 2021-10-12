(function (global, factory) {
  var namespace = 'va6/playingstate';
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


  // NB: 「pos」について。
  //     posは、「あるbufをどこまで再生したか」を示す値で、
  //     単位は秒だが実際の再生秒数との相関関係がなく、
  //     bufのオリジナルsampleRateで換算した秒が単位になっている。
  //     (実際の再生はpitchによって速度が変動する)
  //     またループが発生した場合はposも巻き戻る。
  //     posではなく、実際の秒数(時間)を示す場合は
  //     「timestamp」(currentTimeベースの値の場合)、
  //     「sec」(差分表現の場合)という名称を使う。




  // パラメータは引数ではなくsetで付ける方針で(動的変更に対応する為)
  exports.make = function (buf) {
    var ps = {
      // 再生パラメータ。buf以外は後でset系で設定する事
      buf: buf,
      volume: 1,
      pan: 0,
      pitch: 1,
      loopStartPos: null, // ループ時に戻ってくる位置
      endPos: null, // 再生終了位置。loopStartPosが非nullならループ終端を示す。loopStartPosがありendPosがnullならbuf終端がループ終端
      endedHandle: null, // 再生完了時に実行されるthunk
      // 内部ステート系
      savePos: null, // この音源の再生開始pos(自動更新あり)
      saveTimestamp: null, // 上記savePosが最後に更新された際のac.currentTime値
      nodeSet: null, // 再生停止後はnullになる
      stoppingPos: 0, // この音源が停止している場合はここに停止posを入れる
      // 以上
      type: "playingState"
    };
    return ps;
  };


  exports.setVolume = function (ps, volume) {
    ps.volume = volume;
    if (ps.nodeSet) { webaudio.setVolume(ps.nodeSet, ps.volume); }
    return ps;
  };
  exports.setPan = function (ps, pan) {
    ps.pan = pan;
    if (ps.nodeSet) { webaudio.setPan(ps.nodeSet, ps.pan); }
    return ps;
  };
  exports.setPitch = function (ps, pitch) {
    ps.pitch = pitch;
    if (ps.nodeSet) { webaudio.setPitch(ps.nodeSet, ps.pitch); }
    return ps;
  };
  exports.setLoopStartPos = function (ps, loopStartPos) {
    ps.loopStartPos = loopStartPos;
    return ps;
  };
  exports.setEndPos = function (ps, endPos) {
    ps.endPos = endPos;
    return ps;
  };
  // NB: endedHandleは以前の値を見る必要があるので、使う場合は要注意！
  //     (以前の値を捨てるべき時と、mergeすべき時とがあり、難しい)
  exports.setEndedHandle = function (ps, endedHandle) {
    ps.endedHandle = endedHandle;
    return ps;
  };
  // NB: 再生位置をセットできるのは停止時のみ
  exports.setPos = function (ps, pos) {
    if (ps.nodeSet) {
      log.error(["playingstate.setPos", "should be stopped", ps, pos]);
    }
    else {
      ps.stoppingPos = pos;
    }
    return ps;
  };



  exports.getPos = function (ps) {
    if (ps.stoppingPos != null) {
      return ps.stoppingPos;
    }
    var nowTimestamp = webaudio.getAudioContext().currentTime || 0;
    var elapsedSec = nowTimestamp - ps.saveTimestamp;
    var pos = ps.savePos + (elapsedSec * ps.pitch);
    var endPos = (ps.endPos == null) ? ps.buf.duration : ps.endPos;
    return Math.min(pos. endPos);
  };



  // playを停止(一時停止含む)する。
  // (なおloopStartPosが設定されていないpsは勝手にstopする)
  // stopしたpsはplayによって停止位置から再開する事が可能だが、
  // この再開機能は基本的にバックグラウンド一時停止の為のものとなる。
  exports.stop = function (ps) {
    // TODO
      //endedHandle: null, // 再生完了時に実行されるthunk
      //// 内部ステート系
      //savePos: null, // この音源の再生開始pos(自動更新あり)
      //saveTimestamp: null, // 上記savePosが最後に更新された際のac.currentTime値
      //nodeSet: null, // 再生停止後はnullになる
      //stoppingPos: 0, // この音源が停止している場合はここに停止posを入れる
    return ps;
  };



  // make直後は再生されていない状態なので、これで再生する。
  // 一度stopした場合もこれで再生する。
  // 既に再生されている場合は何もしない。
  // 再生のやり直しをしたい場合は先に明示的にstopする事。
  exports.play = function (ps) {
    // TODO
      //buf: buf,
      //volume: 1,
      //pan: 0,
      //pitch: 1,
      //loopStartPos: null, // ループ時に戻ってくる位置
      //endPos: null, // 再生終了位置。loopStartPosが非nullならループ終端を示す。loopStartPosがありendPosがnullならbuf終端がループ終端
      //endedHandle: null, // 再生完了時に実行されるthunk
      //// 内部ステート系
      //savePos: null, // この音源の再生開始pos(自動更新あり)
      //saveTimestamp: null, // 上記savePosが最後に更新された際のac.currentTime値
      //nodeSet: null, // 再生停止後はnullになる
      //stoppingPos: 0, // この音源が停止している場合はここに停止posを入れる
    return ps;
  };





  Object.defineProperty(exports, '__esModule', { value: true });
})));
