(function (global, factory) {
  var namespace = 'VA6/PlayArg';
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


  var Config = importLoadedModule('VA6/Config');
  var Log = importLoadedModule('VA6/Log');
  var Validate = importLoadedModule('VA6/Validate');


  // 仕様メモ
  // - ユーザの指定したパラメータのvalidateと正規化を行う
  // - 進行に応じた内部ステートは持たない
  //   (path->bufの参照等はcache側で持つ)
  // - いくつかのパラメータはalias等がある。注意

  // ここにない名前のパラメータは警告が出る
  var argNameWhitelist = [
    "buf",
    "path",
    "builtin",
    "channel",
    "volume",
    "pan",
    "pitch",
    "startPos",
    "loopStartPos",
    "isLoop",
    "endPos",
    "loopEndPos",
    "fadeinSec",
    "transitionMode",
    "isAlarm"];
  var argNameWhitelistMap = {};
  argNameWhitelist.forEach(function (k) { argNameWhitelistMap[k] = true; });


  // 正規化する。startPos/isLoop/loopEndPosはなくなり、posが増える
  exports.normalize = function (mode, opts) {
    var result = {mode: mode};

    // buf, path, builtin はどれか一つだけ指定する
    var checkedCount = 0;
    if (opts.buf) {
      if (typeof AudioBuffer !== 'undefined') {
        var v = Validate.instanceOf("buf", opts.buf, AudioBuffer, null);
        result.buf = v;
        if (v == null) { return null; }
      }
      else {
        result.buf = opts.buf;
      }
      checkedCount++;
    }
    if (opts.path != null) {
      var v = Validate.string("path", opts.path, false, null);
      result.path = v;
      checkedCount++;
      if (v == null) { return null; }
    }
    if (opts.builtin != null) {
      var v = Validate.string("builtin", opts.builtin, false, null);
      result.builtin = v;
      checkedCount++;
      if (v == null) { return null; }
    }
    if (1 != checkedCount) {
      Log.error(["must need one of buf, path, builtin", opts]);
      return null;
    }

    // channelが空ならmode別のデフォルトチャンネルを適用する
    if (mode == "bgm") { result.channel = "_bgm_main"; }
    else if (mode == "se") { result.channel = null; } // TODO: 毎回違う値を発行する必要がある。どうする？ここではnullにし、manager側で付与する？
    else if (mode == "voice") { result.channel = "_voice_main"; }
    else {
      Log.error(["found unknown mode", mode]);
      return null;
    }
    if (opts.channel != null) {
      var v = Validate.string("channel", opts.channel, false, null);
      result.channel = v;
      if (v == null) { return null; }
    }

    result.volume = 1;
    if (opts.volume != null) {
      var v = Validate.number("volume", 0, opts.volume, 1, 1);
      result.volume = v;
    }
    result.pan = 0;
    if (opts.pan != null) {
      var v = Validate.number("pan", -1, opts.pan, 1, 0);
      result.pan = v;
    }
    result.pitch = 1;
    if (opts.pitch != null) {
      var v = Validate.number("pitch", 0.001, opts.pitch, 1000, 1);
      result.pitch = v;
    }

    var loopStartPos = null;
    if (opts.loopStartPos != null) {
      var v = Validate.number("loopStartPos", 0, opts.loopStartPos, null, 0);
      loopStartPos = v;
    }

    result.pos = 0;
    if (loopStartPos != null) {
      result.pos = loopStartPos;
    }
    if (opts.startPos != null) {
      var v = Validate.number("startPos", 0, opts.startPos, null, null);
      if (v != null) { result.pos = v; }
    }

    // modeによってloopStartPosのデフォルト値は変化する
    result.loopStartPos = null;
    if (mode == "bgm") { result.loopStartPos = 0; }
    // isLoopとloopEndPosは、指定を受け付けるが、これはwebaudioには渡されない。
    // 適切にloopStartPosやendPosに変換する。
    if (opts.isLoop === true) { result.loopStartPos = 0; }
    else if (opts.isLoop === false) { result.loopStartPos = null; }
    if (loopStartPos != null) { result.loopStartPos = loopStartPos; }

    result.endPos = null;
    if ((loopStartPos != null) && (opts.loopEndPos != null)) {
      var v = Validate.number("loopEndPos", loopStartPos, opts.loopEndPos, null, null);
      result.endPos = v;
    }
    if (opts.endPos != null) {
      var v = Validate.number("endPos", 0, opts.endPos, null, null);
      result.endPos = v;
    }

    result.fadeinSec = 0;
    if (opts.fadeinSec != null) {
      var v = Validate.number("fadeinSec", 0, opts.fadeinSec, null, 0);
      result.fadeinSec = v;
    }

    var transitionModeEnum = [
      "connectNever",
      "connectIfSame",
      "connectIfPossible"];
    var transitionModeDefault = "connectIfSame";
    result.transitionMode = transitionModeDefault;
    if (opts.transitionMode != null) {
      var v = Validate.enumerated("transitionMode", opts.transitionMode, transitionModeEnum, transitionModeDefault);
      result.transitionMode = v;
    }

    result.isAlarm = !!opts.isAlarm;


    // optsが上記以外のパラメータを持っていた場合は警告を出す
    var unknownArgs = [];
    Object.keys(opts).forEach(function (k) {
      if (!argNameWhitelistMap[k]) { unknownArgs.push(k); }
    });
    if (unknownArgs.length) {
      Log.error(["found unknown options, but continue", unknownArgs]);
    }

    return result;
  };







  Object.defineProperty(exports, '__esModule', { value: true });
})));
