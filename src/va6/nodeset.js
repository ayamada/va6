(function (global, factory) {
  var namespace = 'va6/nodeset';
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
  var config = importLoadedModule('va6/config');
  var webaudio = importLoadedModule('va6/webaudio');




  // TODO: faderNodeとか足す事を検討



  exports.disconnectNodeSafely = function (node) {
    if (node == null) { return; }
    if (!node.disconnect) {
      log.error(["is not node", node]);
      return;
    }
    try { node.disconnect(); } catch (e) { log.debug(e); }
    if (node.buffer) {
      try { node.buffer = null; } catch (e) { log.debug(e); }
    }
  };


  exports.stop = function (nodeSet) {
    if (!nodeSet) { return; }
    try { nodeSet.gainNode.gain.value = 0; } catch (e) { log.debug(e); }
    try { nodeSet.sourceNode.stop(); } catch (e) { log.debug(e); }
  };

  // makeが返したnodeSetを適切に切断除去する。
  // stopは事前に行っておくのが望ましいが、行ってなければここで行う。
  exports.disconnect = function (nodeSet) {
    if (!nodeSet) { return null; }
    exports.stop(nodeSet);
    exports.disconnectNodeSafely(nodeSet.sourceNode);
    exports.disconnectNodeSafely(nodeSet.gainNode);
    exports.disconnectNodeSafely(nodeSet.pannerNode);
  };


  // makeが返したnodeSetを適切にacに接続する。ac以外も指定可能
  exports.connect = function (nodeSet, target) {
    if (!target) {
      webaudio.connectMasterGainNode(nodeSet.gainNode);
    }
    else {
      nodeSet.gainNode.connect(target);
    }
  };


  exports.setVolume = function (nodeSet, volume) {
    nodeSet.gainNode.gain.value = volume;
  };


  exports.setPan = function (nodeSet, pan) {
    if (nodeSet.pannerNodeType == "stereoPannerNode") {
      nodeSet.pannerNode.pan.value = pan;
    }
    else if (nodeSet.pannerNodeType == "pannerNode") {
      nodeSet.pannerNode.setPosition(pan, 0, 1-Math.abs(pan));
    }
  };


  exports.setPitch = function (nodeSet, pitch) {
    try {
      // TODO: これまでの再生開始状態、現在の再生pos等の取得が必要
      nodeSet.sourceNode.playbackRate.value = pitch;
      // TODO: 再生開始状態の更新が必要
    } catch (e) {
      log.debug(e);
    }
  };


  // NB: 引数のsourceNodeに、geinNodeとpannerNodeを生やす。
  //     返り値として、disconnectに渡せるnodeSetを返すので、
  //     きちんと保持しておく事。
  //     この後に、返り値内のgainNodeをどこかにconnectする事。
  exports.make = function (ctx, sourceNode, volume, pan, pitch) {
    if (!ctx) { ctx = ac; }
    if (!ctx) { return null; }
    if (volume == null) { volume = 1; }
    if (pan == null) { pan = 0; }
    if (pitch == null) { pitch = 1; }

    var gainNode = ctx.createGain();

    var pannerNode = null;
    var pannerNodeType = null;
    if (ctx.createStereoPanner) {
      pannerNodeType = "stereoPannerNode";
      pannerNode = ctx.createStereoPanner();
      sourceNode.connect(pannerNode);
      pannerNode.connect(gainNode);
    }
    else if (ctx.createPanner) {
      pannerNodeType = "pannerNode";
      pannerNode = ctx.createPanner();
      pannerNode.panningModel = "equalpower";
      sourceNode.connect(pannerNode);
      pannerNode.connect(gainNode);
    }
    else {
      pannerNodeType = "none";
      pannerNode = null;
      sourceNode.connect(gainNode);
    }

    var nodeSet = {
      sourceNode: sourceNode,
      gainNode: gainNode,
      pannerNode: pannerNode,
      pannerNodeType: pannerNodeType
    };
    exports.setVolume(nodeSet, volume);
    exports.setPan(nodeSet, pan);
    exports.setPitch(nodeSet, pitch);
    return nodeSet;
  };









  Object.defineProperty(exports, '__esModule', { value: true });
})));
