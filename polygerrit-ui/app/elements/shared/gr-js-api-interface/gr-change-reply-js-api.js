// Copyright (C) 2016 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
(function(window) {
  'use strict';

  /**
   * @deprecated
   */
  function GrChangeReplyInterfaceOld(el) {
    this._el = el;
  }

  GrChangeReplyInterfaceOld.prototype.getLabelValue = function(label) {
    return this._el.getLabelValue(label);
  };

  GrChangeReplyInterfaceOld.prototype.setLabelValue = function(label, value) {
    this._el.setLabelValue(label, value);
  };

  GrChangeReplyInterfaceOld.prototype.send = function(opt_includeComments) {
    return this._el.send(opt_includeComments);
  };

  function GrChangeReplyInterface(plugin, el) {
    GrChangeReplyInterfaceOld.call(this, el);
    this.plugin = plugin;
    this._hookName = (plugin.getPluginName() || 'test') + '-autogenerated-'
      + String(Math.random()).split('.')[1];
  }
  GrChangeReplyInterface.prototype._hookName = '';
  GrChangeReplyInterface.prototype._hookClass = null;
  GrChangeReplyInterface.prototype._hookPromise = null;

  GrChangeReplyInterface.prototype =
    Object.create(GrChangeReplyInterfaceOld.prototype);
  GrChangeReplyInterface.prototype.constructor = GrChangeReplyInterface;

  GrChangeReplyInterface.prototype.addReplyTextChangedCallback =
    function(handler) {
      this.plugin.hook('reply-text').onAttached(el => {
        if (!el.content) { return; }
        el.content.addEventListener('value-changed', e => {
          handler(e.detail.value);
        });
      });
    };

  window.GrChangeReplyInterface = GrChangeReplyInterface;
})(window);
