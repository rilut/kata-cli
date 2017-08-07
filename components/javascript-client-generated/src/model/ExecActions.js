/**
 * Zaun
 * Zaun service 
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ProcessedMessage'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ProcessedMessage'));
  } else {
    // Browser globals (root is window)
    if (!root.Zaun) {
      root.Zaun = {};
    }
    root.Zaun.ExecActions = factory(root.Zaun.ApiClient, root.Zaun.ProcessedMessage);
  }
}(this, function(ApiClient, ProcessedMessage) {
  'use strict';




  /**
   * The ExecActions model module.
   * @module model/ExecActions
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ExecActions</code>.
   * @alias module:model/ExecActions
   * @class
   */
  var exports = function() {
    var _this = this;






  };

  /**
   * Constructs a <code>ExecActions</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ExecActions} obj Optional instance to populate.
   * @return {module:model/ExecActions} The populated <code>ExecActions</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('flow')) {
        obj['flow'] = ApiClient.convertToType(data['flow'], 'String');
      }
      if (data.hasOwnProperty('state')) {
        obj['state'] = ApiClient.convertToType(data['state'], 'String');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ProcessedMessage.constructFromObject(data['message']);
      }
      if (data.hasOwnProperty('context')) {
        obj['context'] = ApiClient.convertToType(data['context'], Object);
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = ApiClient.convertToType(data['data'], Object);
      }
    }
    return obj;
  }

  /**
   * @member {String} flow
   */
  exports.prototype['flow'] = undefined;
  /**
   * @member {String} state
   */
  exports.prototype['state'] = undefined;
  /**
   * @member {module:model/ProcessedMessage} message
   */
  exports.prototype['message'] = undefined;
  /**
   * @member {Object} context
   */
  exports.prototype['context'] = undefined;
  /**
   * @member {Object} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));


