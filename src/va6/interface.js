(function (global, factory) {
  var namespace = 'VA6';
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


  var Validate = importLoadedModule('VA6/Validate');


  var Config = importLoadedModule('VA6/Config');
  exports.getConfig = Config.get;
  exports.setConfig = Config.set;
  exports.config = Config.proxy;


  // TODO: この辺りのexports対象がきちんとマッピングされてるか怪しい(特にコメントアウト状態のもの)。あとで確認して修正する事


  var WebAudio = importLoadedModule('VA6/WebAudio');
  //exports.setVolumeMaster = WebAudio.setVolumeMaster;
  exports.isActivatedAudioContext = WebAudio.isActivatedAudioContext;
  exports.getAudioContext = WebAudio.getAudioContext;
  exports.getAudioContextAsync = WebAudio.getAudioContextAsync;
  exports.connectMasterGainNode = WebAudio.connectMasterGainNode;
  exports.createOfflineAudioContext = WebAudio.createOfflineAudioContext;
  exports.init = WebAudio.init;
  //exports.disconnectNodeSafely = WebAudio.disconnectNodeSafely;
  //exports.stopNodeSet = WebAudio.stopNodeSet;
  //exports.setupNodeSet = WebAudio.setupNodeSet;
  //exports.setVolume = WebAudio.setVolume;
  //exports.setPan = WebAudio.setPan;
  //exports.setPitch = WebAudio.setPitch;


  var NodeSet = importLoadedModule('VA6/NodeSet');


  var PlayingState = importLoadedModule('VA6/PlayingState');
  //exports.makePS = PlayingState.make;
  //exports.playPS = PlayingState.play;
  //exports.stopPS = PlayingState.stop;
  //exports.setVolume = PlayingState.setVolume;
  //exports.setPan = PlayingState.setPan;
  //exports.setPitch = PlayingState.setPitch;
  //exports.setPos = PlayingState.setPos;
  //exports.setLoopStartPos = PlayingState.setLoopStartPos;
  //exports.setEndPos = PlayingState.setEndPos;
  //exports.setEndedHandle = PlayingState.setEndedHandle;


  var PlayArg = importLoadedModule('VA6/PlayArg');


  var Se = importLoadedModule('VA6/Se');











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
    var ns = NodeSet.make(oac, osc, vol, pan);
    NodeSet.connect(ns, oac.destination);
    // TODO: attack/decay/sustain/releaseっぽく制御したい。できるか？
    // TODO: 音楽的に複数の音を出すには？
    // TODO: この処理を汎用的にできるか？
    osc.start();
    oac.startRendering().then(function(buf) {
      debugBuf = buf;
      osc.stop();
      osc.disconnect();
      NodeSet.disconnect(ns);
      //oac.close(); // OfflineAudioContextはcloseできないらしい。startRenderingだけでもうclose状態になるようだ
    });
  }
  prepareDebugBuf();

  exports.debug = function () {
    if (!debugBuf) { return; }
    Se.playProto({buf: debugBuf});
  };


  // nodeやworkers等でoacのみ使うケースがある
  if (typeof window !== 'undefined') {
    exports.init();
  }


  Object.defineProperty(exports, '__esModule', { value: true });
})));
