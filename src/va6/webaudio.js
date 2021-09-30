(function (global, factory) {
  var namespace = 'va6/webaudio';
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global[namespace] = {}));
}(this, (function (exports) { 'use strict';


  var root = {};
  if (typeof window !== 'undefined') { root = window; }
  else if (typeof global !== 'undefined') { root = global; }



  function resolveAudioContextClass () {
    return root.AudioContext || root.webkitAudioContext;
  }
  function resolveOfflineAudioContextClass () {
    return root.OfflineAudioContext || root.webkitOfflineAudioContext;
  }



  var ac = null;
  var initError = null;

  function waitAudioContext (done, err) {
    if (ac) { return done(ac); }
    exports.init();
    if (initError) {
      return err(initError);
    }
    setTimeout(waitAudioContext.bind(undefined, done, err), 200);
  }

  exports.isActivatedAudioContext = function () { return !!ac; };
  exports.getAudioContextAsync = function () {
    return new Promise(waitAudioContext);
  };

  exports.createOfflineAudioContext = function (options) {
    var oacc = resolveOfflineAudioContextClass();
    if (!oacc) { return null; }
    return new oacc(options);
  };



  function detectActivationType () {
    var type = "others";
    if (navigator.userAgentData) {
      navigator.userAgentData.brands.forEach(function (entry) {
        if (entry.brand.toLowerCase().indexOf("chromium") !== -1) {
          type = "chromium";
        }
      });
    }
    return type;
  }

  // chromiumに最適化されたハンドル設定を行う
  function setupChromium () {
    var acc = resolveAudioContextClass();
    throw new Error("not implemented yet");
    //ac = new acc();
  }

  // safari向けのハンドル設定を行う(ただしchromium向けの対応も含む)
  function setupCommon () {
    var acTmp = new (resolveAudioContextClass())();
    function playSilence () { acTmp.createBufferSource().start(0); }

    // resumeによるchrome向け対応
    // TODO
    // function makeHandleResume (k) {
    //   function handle (e) {
    //     // NB: こっちのunlockは何度か行う必要がある
    //     //     (doResume()が偽値を返したら次のイベントでまたリトライする)
    //     if (!doResume()) { return; }
    //     document.removeEventListener(k, handle, false);
    //   }
    //   return handle;
    // }
    // var resumeKeys = ["touchstart", "touchend", "mousedown", "keydown"];
    // resumeKeys.forEach(function (k) {
    //   document.addEventListener(k, makeHandleResume(k), false);
    // });
    // ac = acTmp;

    // safari向け対応
    function handlePlay (e) {
      playSilence();
      document.removeEventListener("touchstart", handlePlay, false);
      ac = acTmp;
    }
    document.addEventListener("touchstart", handlePlay, false);
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
    // TODO: 引数指定によって、強制的に常にothersにする機能があってもよい
    var activationType = detectActivationType();
    if (!options.isSkipUnlock && !options.isSkipOptimizeChromium && (activationType == "chromium")) {
      setupChromium();
    }
    else if (!options.isSkipUnlock && (activationType == "others")) {
      setupCommon();
    }
    else {
      ac = new acc();
    }
  };


















  Object.defineProperty(exports, '__esModule', { value: true });
})));
