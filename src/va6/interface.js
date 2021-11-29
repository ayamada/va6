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







  // nodeやworkers等でoacのみ使うケースがある
  if (typeof window !== 'undefined') {
    exports.init();
  }


  Object.defineProperty(exports, '__esModule', { value: true });
})));
