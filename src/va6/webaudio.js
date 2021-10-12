(function (global, factory) {
  var namespace = 'va6/webaudio';
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


  function resolveAudioContextClass () {
    return root.AudioContext || root.webkitAudioContext;
  }
  function resolveOfflineAudioContextClass () {
    return root.OfflineAudioContext || root.webkitOfflineAudioContext;
  }



  var ac = null;
  var initError = null;
  var masterGainNode = null;



  exports.setVolumeMaster = function (volume) {
    if (!masterGainNode) { return; }
    masterGainNode.gain.value = volume;
    return;
  };





  function setupAudioContext (newAc) {
    if (ac) {
      if (ac !== newAc) { try { newAc.close() } catch (e) {} }
      return;
    }
    ac = newAc;
    masterGainNode = ac.createGain();
    masterGainNode.gain.value = config.proxy.volumeMaster;
    masterGainNode.connect(ac.destination);
    // NB: メイングラフをもっと構築する必要があるなら、ここで行う
  }


  function waitAudioContext (done, err) {
    if (ac) { return done(ac); }
    exports.init();
    if (initError) {
      return err(initError);
    }
    setTimeout(waitAudioContext.bind(undefined, done, err), 200);
  }

  exports.isActivatedAudioContext = function () { return !!ac; };
  exports.getAudioContext = function () {
    exports.init();
    return ac;
  };
  exports.getAudioContextAsync = function () {
    exports.init();
    return new Promise(waitAudioContext);
  };

  exports.connectMasterGainNode = function (node) {
    exports.init();
    if (!masterGainNode) { return false; }
    node.connect(masterGainNode);
    return true;
  };

  exports.createOfflineAudioContext = function (sec) {
    var oacc = resolveOfflineAudioContextClass();
    if (!oacc) { return null; }
    if (sec <= 0) { throw new Error("sec must be positive number"); }
    var numberOfChannels = config.proxy.OAC_numberOfChannels;
    var sampleRate = config.proxy.OAC_sampleRate;
    return new oacc({
      numberOfChannels: numberOfChannels,
      sampleRate: sampleRate,
      length: sampleRate * sec
    });
  };



  function detectActivationType (options) {
    var type = "others";
    if (options.isSkipChromiumOptimize) { return type; }
    if (navigator.userAgentData) {
      navigator.userAgentData.brands.forEach(function (entry) {
        if (entry.brand.toLowerCase().indexOf("chromium") != -1) {
          type = "chromium";
        }
      });
    }
    return type;
  }

  // chromiumに最適化されたハンドル設定を行う(constructor実装)
  function setupChromiumOptimized () {
    var acc = resolveAudioContextClass();
    (["touchend", "mouseup"]).forEach(function (k) {
      var h = null;
      h = function (e) {
        // NB: 何度もリトライする必要があるかもしれない
        var acTmp = new acc();
        if (acTmp.state == "suspended") {
          log.debug(["setupChromiumOptimized", "failed to create ac, retry"]);
          acTmp.close();
          return;
        }
        document.removeEventListener(k, h, false);
        log.debug(["setupChromiumOptimized", "succeeded to create ac"]);
        setupAudioContext(acTmp);
      };
      document.addEventListener(k, h, false);
    });
  }

  // chromium向けハンドル設定を行う(resume実装)
  // NB: AudioContextをsuspendする場合、この処理が誤判定を起こすケースがある。
  //     バックグラウンド化等で一時停止したい場合であっても、
  //     AudioContextをsuspendするのは避けた方がよい。
  //     (そうではなくAudioSourceの方を一時停止させた方がよい)
  function setupChromium(acTmp) {
    var isResumeRunning = false; // TODO: これを使うかはよく分からない、要確認

    function doResume () {
      // アンロックが完了している場合はそのまま終わる
      if (ac) { return true; }
      if (!acTmp.resume) {
        // resume機能を持っていない。そのままいける筈
        log.debug(["setupChromium", "resume not found, already unlocked"]);
        return true;
      }
      if (acTmp.state !== "suspended") {
        // unlock完了
        log.debug(["setupChromium", "already unlocked"]);
        return true;
      }
      if (isResumeRunning) {
        // 既にresume実行中で終了を待っている場合は、次回またチェックする
        log.debug(["setupChromium", "already running"]);
        return false;
      }
      // resumeを実行する
      log.debug(["setupChromium", "try to resume"]);
      isResumeRunning = true;
      acTmp.resume().then(
        function () {
          isResumeRunning = false;
          if (!ac) { log.debug(["setupChromium", "succeeded to resume"]); }
          setupAudioContext(acTmp);
        },
        function () {
          // resume失敗は適切なhandle外での実行しかない想定。
          // リトライできるよう再設定する
          isResumeRunning = false;
          log.debug(["setupChromium", "failed to resume, retry"]);
        });
      // まだresumeが成功したかは分からないのでtrueは返せない
      return false;
    }
    (["touchend", "mouseup"]).forEach(function (k) {
      var h = null;
      h = function (e) {
        // NB: 何度もリトライする必要がある
        //     (doResume()が偽値を返したら次のイベントでまたリトライする)
        if (!doResume()) { return; }
        document.removeEventListener(k, h, false);
        setupAudioContext(acTmp);
      };
      document.addEventListener(k, h, false);
    });
  }


  function setupFirefox (acTmp) {
    // firefoxでは、生成直後はsuspendedだが何もしなくてもすぐrunningになる。
    // しかし、それを待つ必要はある
    if (acTmp.state == "suspended") {
      // まだsuspendedならリトライする(うざいのでログは出さない…)
      setTimeout(setupFirefox.bind(undefined, acTmp), 100);
    }
    else if (acTmp.state == "running") {
      if (!ac) { log.debug(["setupFirefox", "succeeded to create ac"]); }
      setupAudioContext(acTmp);
    }
    else {
      log.debug(["setupFirefox", "ac already closed"]);
    }
  }


  function setupSafari (acTmp) {
    (["touchstart", "mousedown"]).forEach(function (k) {
      var h = null;
      h = function (e) {
        var bs = acTmp.createBufferSource();
        bs.start();
        bs.stop();
        document.removeEventListener(k, h, false);
        if (!ac) { log.debug(["setupSafari", "succeeded unlock ac"]); }
        setupAudioContext(acTmp);
      }
      document.addEventListener(k, h, false);
    });
  }


  var isStartedInit = false;
  exports.init = function (options) {
    if (isStartedInit) { return; }
    isStartedInit = true;

    options = options || {};

    var acc = resolveAudioContextClass();
    if (!acc) {
      initError = "AudioContext not found";
      return;
    }

    // アンロックの仕様がブラウザによって違う。
    // chromiumはマウスイベントでインスタンス生成だが、
    // safariおよび他は事前にインスタンスを生成し、マウスイベントで無音再生。
    var activationType = detectActivationType(options);
    if (options.isSkipUnlock) {
      log.debug(["skip to unlock ac"]);
      setupAudioContext(new acc());
    }
    else if (activationType == "chromium") {
      setupChromiumOptimized();
    }
    else if (activationType == "others") {
      var acTmp = new (resolveAudioContextClass())();
      setupFirefox(acTmp);
      setupChromium(acTmp);
      setupSafari(acTmp);
      return;
    }
    else {
      log.debug(["unknown activationType found", activationType]);
      setupAudioContext(new acc());
      return;
    }
  };








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


  exports.stopNodeSet = function (nodeSet) {
    if (!nodeSet) { return; }
    try { nodeSet.gainNode.gain.value = 0; } catch (e) { log.debug(e); }
    try { nodeSet.sourceNode.stop(); } catch (e) { log.debug(e); }
    // if (nodeSet.sourceNode) { nodeSet.sourceNode.onended = null; } // TODO: これを実行するかはかなり悩む
    //nodeSet.playEndedTimestamp = ac.currentTime; // TODO: これをするかはもうちょっと後で判断する
  };

  // NB: setupNodeSetが返したnodeSetを適切に切断除去する。
  //     stopは事前に行っておくのが望ましいが、行ってなければここで行う。
  exports.disconnectNodeSet = function (nodeSet) {
    if (!nodeSet) { return null; }
    exports.stopNodeSet(nodeSet);
    exports.disconnectNodeSafely(nodeSet.sourceNode);
    exports.disconnectNodeSafely(nodeSet.gainNode);
    exports.disconnectNodeSafely(nodeSet.pannerNode);
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
  //     返り値として、disconnectNodeSetに渡せるnodeSetを返すので、
  //     きちんと保持しておく事。
  //     この後に、返り値内のgainNodeをどこかにconnectする事。
  exports.setupNodeSet = function (ctx, sourceNode, volume, pan, pitch) {
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
