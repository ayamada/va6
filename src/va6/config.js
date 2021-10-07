(function (global, factory) {
  var namespace = 'va6/config';
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


  var definitionTable = {};
  var data = {};

  function defineConfig (k, initialValue, validator, updateHandle) {
    definitionTable[k] = {
      validator: validator,
      updateHandle: updateHandle
    };
    data[k] = initialValue;
  }

  function resolveDefinition (k) {
    var definition = definitionTable[k];
    if (!definition) {
      log.error(["found unknown config key", k, ". valid keys are", Object.keys(definitionTable)]);
    }
    return definition;
  }



  exports.get = function (k) {
    if (!resolveDefinition(k)) { return null; }
    return data[k];
  };

  var currentLabel = null; // validatorとupdateHandleの為の参照用
  exports.set = function (k, v) {
    var definition = resolveDefinition(k);
    if (!definition) { return null; }
    var oldValue = data[k];
    var newValue = v;
    currentLabel = k;
    if (definition.validator) {
      newValue = definition.validator(oldValue, v);
    }
    if (oldValue === newValue) { return oldValue; }
    data[k] = newValue;
    if (definition.updateHandle) {
      definition.updateHandle(oldValue, newValue);
    }
    return newValue;
  };

  exports.proxy = new Proxy(data, {
    get: function (obj, prop, receiver) {
      return exports.get(prop);
    },
    set: function (obj, prop, value) {
      return exports.set(prop, value);
    },
    deleteProperty: function (obj, prop) {
      throw new Error("not supported");
    },
    defineProperty: function (obj, prop, desc) {
      throw new Error("not supported");
    }
  });


  // ----------------------------------------------------------------


  function coerceBoolean (oldV, newV) { return !!newV; }
  function coerceVolume (oldV, newV) {
    newV = validate.number(currentLabel, 0, newV, 1, null);
    return (newV == null) ? oldV : newV;
  }
  function coerceInteger (oldV, newV) {
    newV = validate.number(currentLabel, null, newV, null, null);
    return (newV == null) ? oldV : Math.floor(newV);
  }


  defineConfig("isDisplayErrorLog", true, coerceBoolean, null);
  defineConfig("isDisplayDebugLog", false, coerceBoolean, null);


  defineConfig("volumeMaster", 0.8, coerceVolume, function (oldV, newV) {
    importLoadedModule('va6/webaudio').setVolumeMaster(newV);
  });


  defineConfig("OAC_numberOfChannels", 2, coerceInteger, null);
  defineConfig("OAC_sampleRate", 44100, coerceInteger, null);


  // TODO: 必要な項目をひたすらdefineConfig()していく
  // 以下はva5のもの
//  /**
//   * va5.getConfig("volume-bgm")
//   * va5.bgm()全体の音量倍率。変更すると即座に反映される。
//   * デフォルト値0.5。
//   * @name getConfigOption
//   */
//  defineConfig("volume-bgm", 0.5, function (newV, oldV) {
//    newV = va5._validateNumber("volume-bgm", 0, newV, 1, null);
//    return (newV == null) ? oldV : newV;
//  }, function (v) {
//    va5.Bgm.setBaseVolume(v);
//  });
//
//  /**
//   * va5.getConfig("volume-se")
//   * va5.se()全体の音量倍率。変更すると即座に反映される。
//   * デフォルト値0.5。
//   * @name getConfigOption
//   */
//  defineConfig("volume-se", 0.5, function (newV, oldV) {
//    newV = va5._validateNumber("volume-se", 0, newV, 1, null);
//    return (newV == null) ? oldV : newV;
//  }, function (v) {
//    va5.Se.setBaseVolume(v);
//  });
//
//  /**
//   * va5.getConfig("volume-voice")
//   * va5.voice()全体の音量倍率。変更すると即座に反映される。
//   * デフォルト値0.5。
//   * @name getConfigOption
//   */
//  defineConfig("volume-voice", 0.5, function (newV, oldV) {
//    newV = va5._validateNumber("volume-voice", 0, newV, 1, null);
//    return (newV == null) ? oldV : newV;
//  }, function (v) {
//    va5.Bgm.setBaseVolumeVoice(v);
//  });
//
//  /**
//   * va5.getConfig("default-bgm-fade-sec")
//   * BGMをフェードアウト終了させる際のデフォルトのフェード秒数。
//   * デフォルト値1。
//   * @name getConfigOption
//   */
//  defineConfig("default-bgm-fade-sec", 1, function (newV, oldV) {
//    newV = va5._validateNumber("default-bgm-fade-sec", 0, newV, null);
//    return (newV == null) ? oldV : newV;
//  }, null);
//
//  /**
//   * va5.getConfig("default-se-fade-sec")
//   * SEをフェードアウト終了させる際のデフォルトのフェード秒数。
//   * デフォルト値0。
//   * @name getConfigOption
//   */
//  defineConfig("default-se-fade-sec", 0, function (newV, oldV) {
//    newV = va5._validateNumber("default-se-fade-sec", 0, newV, null);
//    return (newV == null) ? oldV : newV;
//  }, null);
//
//  /**
//   * va5.getConfig("default-voice-fade-sec")
//   * Voiceをフェードアウト終了させる際のデフォルトのフェード秒数。
//   * デフォルト値0.1。
//   * @name getConfigOption
//   */
//  defineConfig("default-voice-fade-sec", 0.1, function (newV, oldV) {
//    newV = va5._validateNumber("default-voice-fade-sec", 0, newV, null);
//    return (newV == null) ? oldV : newV;
//  }, null);
//
//  /**
//   * va5.getConfig("is-pause-on-background")
//   * これが真値ならタブがバックグラウンドになった際にBGMを停止します。
//   * デフォルト値false。
//   * @name getConfigOption
//   */
//  defineConfig("is-pause-on-background", false, function (newV, oldV) {
//    return !!newV;
//  }, null);
//
//  /**
//   * va5.getConfig("is-unload-automatically-when-finished-bgm")
//   * 真値ならbgm/voiceの終了時に自動的に va5.unloadIfUnused() を実行します。
//   * デフォルト値false。
//   * @name getConfigOption
//   */
//  defineConfig("is-unload-automatically-when-finished-bgm", false, function (newV, oldV) {
//    return !!newV;
//  }, null);
//
//  /**
//   * va5.getConfig("se-chattering-sec")
//   * 同一SEがこの秒数以内に連打された場合は再生を抑制する。
//   * デフォルト値0.05。
//   * ※この値を動的に変更するのはおすすめしません。
//   * SE毎に変動させたい場合は va5.makePlaySePeriodically() を推奨します。
//   * @name getConfigOption
//   */
//  defineConfig("se-chattering-sec", 0.05, function (newV, oldV) {
//    newV = va5._validateNumber("se-chattering-sec", 0, newV, null);
//    return (newV == null) ? oldV : newV;
//  }, null);
//
//  /**
//   * va5.getConfig("is-use-dumb-mode-forcibly")
//   * 常にDumbモード(無音モード)で起動する。デバッグ用。
//   * デフォルト値false。
//   * va5.init() 後にこの値を変更しても効果がありません。
//   * @name getConfigOption
//   */
//  defineConfig("is-use-dumb-mode-forcibly", false, function (newV, oldV) {
//    return !!newV;
//  }, null);
//
//  /**
//   * va5.getConfig("additional-query-string")
//   * pathをロードする際に自動的にこの文字列をQUERY_STRINGとして付与する。
//   * なお自動ではuriエスケープされないのでその点に注意する事。
//   * デフォルト値null。
//   * @name getConfigOption
//   */
//  defineConfig("additional-query-string", null, function (newV, oldV) {
//    // 悩んだ結果、これはassertもstringifyも行わない事にした
//    // (Date.now()のような、数値である事が重要なケースが稀にあるし、
//    // nullにも「この機能を使わない」という意味がある為)
//    return newV;
//  }, null);


  Object.defineProperty(exports, '__esModule', { value: true });
})));
