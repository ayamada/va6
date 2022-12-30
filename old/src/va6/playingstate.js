(function (global, factory) {
  var namespace = 'VA6/PlayingState';
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


  var Log = importLoadedModule('VA6/Log');
  var Config = importLoadedModule('VA6/Config');
  var WebAudio = importLoadedModule('VA6/WebAudio');
  var NodeSet = importLoadedModule('VA6/NodeSet');


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
      loopStartPos: null, // ループ時に戻ってくる位置。nullなら非ループ音源
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
    if (ps.nodeSet) { NodeSet.setVolume(ps.nodeSet, ps.volume); }
    return ps;
  };
  exports.setPan = function (ps, pan) {
    ps.pan = pan;
    if (ps.nodeSet) { NodeSet.setPan(ps.nodeSet, ps.pan); }
    return ps;
  };
  exports.setPitch = function (ps, pitch) {
    ps.pitch = pitch;
    if (ps.nodeSet) { NodeSet.setPitch(ps.nodeSet, ps.pitch); }
    return ps;
  };
  // NB: 以下のパラメータを変更できるのは停止時のみ
  exports.setPos = function (ps, pos) {
    if (ps.nodeSet) {
      Log.error(["playingstate.setPos", "should be stopped", ps, pos]);
      return ps;
    }
    ps.stoppingPos = pos;
    return ps;
  };
  exports.setLoopStartPos = function (ps, loopStartPos) {
    if (ps.nodeSet) {
      Log.error(["playingstate.setLoopStartPos", "cannot set in playing", ps, loopStartPos]);
      return ps;
    }
    ps.loopStartPos = loopStartPos;
    return ps;
  };
  exports.setEndPos = function (ps, endPos) {
    if (ps.nodeSet) {
      Log.error(["playingstate.setEndPos", "cannot set in playing", ps, endPos]);
      return ps;
    }
    ps.endPos = endPos;
    return ps;
  };
  // NB: endedHandleは以前の値を見る必要があるので、使う場合は要注意！
  //     (以前の値を捨てるべき時と、mergeすべき時とがあり、難しい)
  exports.setEndedHandle = function (ps, endedHandle) {
    if (ps.nodeSet) {
      Log.error(["playingstate.setEndedHandle", "cannot set in playing", ps, endedHandle]);
      return ps;
    }
    ps.endedHandle = endedHandle;
    return ps;
  };



  exports.getPos = function (ps) {
    var pos = null;
    if (ps.stoppingPos != null) {
      pos =  ps.stoppingPos;
    }
    else {
      var ac = WebAudio.getAudioContext();
      var nowTimestamp = ac ? ac.currentTime : 0;
      var elapsedSec = nowTimestamp - ps.saveTimestamp;
      pos = ps.savePos + (elapsedSec * ps.pitch);
    }
    var endPos = (ps.endPos == null) ? ps.buf.duration : ps.endPos;
    if (pos <= endPos) { return pos; }
    // 終端を越えている場合は終端処理が必要になる
    if (ps.loopStartPos == null) { return endPos; }
    while (endPos <= pos) {
      pos = pos - (endPos - ps.loopStartPos);
    }
    pos = Math.max(0, pos);
    return pos;
  };



  // playを停止(一時停止含む)する。
  // 既に停止している場合は何もしない。
  // (なおloopStartPosが設定されていないpsは勝手にstopする)
  // stopしたpsはplayによって停止位置から再開する事が可能だが、
  // この再開機能は基本的にバックグラウンド一時停止の為のものとなる。
  exports.stop = function (ps) {
    var pos = exports.getPos(ps);
    if (!ps.nodeSet) { return null; }
    NodeSet.disconnect(ps.nodeSet);
    ps.savePos = null;
    ps.saveTimestamp = null;
    ps.nodeSet = null;
    ps.stoppingPos = pos;
    if (ps.endedHandle) { ps.endedHandle(); }
    return ps;
  };



  // make直後は再生されていない状態なので、これで再生する。
  // 一度stopした場合もこれで再生する。
  // 既に再生されている場合は何もしない。
  // 再生のやり直しをしたい場合は先に明示的にstopする事。
  exports.play = function (ps) {
    if (ps.nodeSet) { return null; }
    var ac = WebAudio.getAudioContext();
    if (!ac) { return null; }

    // まず最初に再生開始位置の算出を行う
    // (ここで問題がある場合は再生しない)
    var startPos = ps.stoppingPos;
    var endPos = (ps.endPos == null) ? ps.buf.duration : ps.endPos;
    var isLoop = ps.loopStartPos != null;
    // ループ開始がループ終端を越えているなら再生しない
    if (isLoop && (endPos <= ps.loopStartPos)) {
      Log.error(["playingstate.play", "invalid loop parameters, not played", ps]);
      return null;
    }
    // startPosがendPosを越えているなら補正する
    if (endPos <= startPos) {
      if (!isLoop) {
        Log.error(["playingstate.play", "already ended, not played", ps]);
        return null;
      }
      while (endPos <= startPos) {
        startPos = startPos - (endPos - ps.loopStartPos);
      }
      startPos = Math.max(0, startPos);
    }


    var sourceNode = ac.createBufferSource();
    sourceNode.buffer = ps.buf;
    if (isLoop) {
      sourceNode.loop = true;
      sourceNode.loopStart = ps.loopStartPos;
      sourceNode.loopEnd = ps.endPos;
    }
    ps.nodeSet = NodeSet.make(ac, sourceNode);
    NodeSet.connect(ps.nodeSet);

    NodeSet.setVolume(ps.nodeSet, ps.volume);
    NodeSet.setPan(ps.nodeSet, ps.pan);
    NodeSet.setPitch(ps.nodeSet, ps.pitch);

    sourceNode.onended = function () {
      Log.debug(["onended", ps]);
      exports.stop(ps);
    };

    ps.savePos = startPos;
    ps.saveTimestamp = ac.currentTime;
    ps.stoppingPos = null;
    var when = 0; // or ac.currentTime
    var offset = startPos;
    var duration = endPos - startPos;
    if (isLoop) {
      sourceNode.start(when, offset);
    }
    else {
      sourceNode.start(when, offset, duration);
    }
    return ps;
  };





  Object.defineProperty(exports, '__esModule', { value: true });
})));
