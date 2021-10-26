(function (global, factory) {
  var namespace = 'va6';
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
  exports.getConfig = config.get;
  exports.setConfig = config.set;
  exports.config = config.proxy;


  // TODO: この辺りのexports対象がきちんとマッピングされてるか怪しい(特にコメントアウト状態のもの)。あとで確認して修正する事


  var webaudio = importLoadedModule('va6/webaudio');
  //exports.setVolumeMaster = webaudio.setVolumeMaster;
  exports.isActivatedAudioContext = webaudio.isActivatedAudioContext;
  exports.getAudioContext = webaudio.getAudioContext;
  exports.getAudioContextAsync = webaudio.getAudioContextAsync;
  exports.connectMasterGainNode = webaudio.connectMasterGainNode;
  exports.createOfflineAudioContext = webaudio.createOfflineAudioContext;
  exports.init = webaudio.init;
  //exports.disconnectNodeSafely = webaudio.disconnectNodeSafely;
  //exports.stopNodeSet = webaudio.stopNodeSet;
  //exports.setupNodeSet = webaudio.setupNodeSet;
  //exports.setVolume = webaudio.setVolume;
  //exports.setPan = webaudio.setPan;
  //exports.setPitch = webaudio.setPitch;


  var nodeset = importLoadedModule('va6/nodeset');


  var playingstate = importLoadedModule('va6/playingstate');
  //exports.makePS = playingstate.make;
  //exports.playPS = playingstate.play;
  //exports.stopPS = playingstate.stop;
  //exports.setVolume = playingstate.setVolume;
  //exports.setPan = playingstate.setPan;
  //exports.setPitch = playingstate.setPitch;
  //exports.setPos = playingstate.setPos;
  //exports.setLoopStartPos = playingstate.setLoopStartPos;
  //exports.setEndPos = playingstate.setEndPos;
  //exports.setEndedHandle = playingstate.setEndedHandle;


  var playarg = importLoadedModule('va6/playarg');













  // TODO: デバッグ用。最終的には消す。まずこれで音が出るようにし、そこから分化させていく
  var debugBuf = null;
  function prepareDebugBuf () {
    var sec = 0.5;
    var oac = exports.createOfflineAudioContext(sec);
    var osc = oac.createOscillator();
    //var hz = 440;
    var hz = 220 + Math.floor(Math.random()*440);
    osc.type = "square"; // sine, square, sawtooth, triangle
    osc.frequency.setValueAtTime(hz, 0);
    osc.detune.setValueAtTime(0, 0);

    var vol = 0.1;
    var pan = 0;
    var nodeSet = nodeset.make(oac, osc, vol, pan);
    nodeset.connect(nodeSet, oac.destination);
    // TODO: attack/decay/sustain/releaseっぽく制御したい。できるか？
    // TODO: 音楽的に複数の音を出すには？
    // TODO: この処理を汎用的にできるか？
    osc.start();
    oac.startRendering().then(function(buf) {
      debugBuf = buf;
      osc.stop();
      osc.disconnect();
      nodeset.disconnect(nodeSet);
      //oac.close(); // OfflineAudioContextはcloseできないらしい。startRenderingだけでもうclose状態になるようだ
    });
  }
  prepareDebugBuf();

  // TODO: この辺りをどうにかしてモジュール化する必要があるが…

  function seProto2 (cd) {
    var ac = exports.getAudioContext();
    // NB: ここに来た段階で、cd.bufが解決できている前提
    var ps = playingstate.make(cd.buf);

    // TODO: cd.params.channel への対応(詳細未定)
    // TODO: cd.params.fadeinSec への対応
    // NB: cd.params.transitionMode への対応は、seでは不要(bgm/voiceでは必要)
    // NB: cd.params.isAlarm への対応はここでは不要

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

    params = arg.normalize("se", params);
    if (!params) { return; }

    if (params.path != null) {
      log.error(["'path' is not implemented yet", params]);
      return;
    }
    if (params.builtin != null) {
      log.error(["'builtin' is not implemented yet", params]);
      return;
    }

    // bufが解決できたら、channelDataの形にしてseProto2に行ける
    // (今はpathやbuiltin非対応なのでそのまま行けるが、将来はasyncになる)
    var channelData = {
      buf: params.buf,
      params: params
    };
    seProto2(channelData);

    // TODO: 内部で保持しているchannelDataを参照できるようにする

    // TODO: channelDataを参照できる、channel文字列を返す必要がある
    return "TODO";
  }

  exports.debug = function () {
    if (!debugBuf) { return; }
    seProto({buf: debugBuf});
  };


  // nodeやworkers等でoacのみ使うケースがある
  if (typeof window !== 'undefined') {
    exports.init();
  }


  Object.defineProperty(exports, '__esModule', { value: true });
})));
