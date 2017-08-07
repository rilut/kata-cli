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
    // AMD.
    define(['expect.js', '../../src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require('../../src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.Zaun);
  }
}(this, function(expect, Zaun) {
  'use strict';

  var instance;

  beforeEach(function() {
    instance = new Zaun.Intent();
  });

  var getProperty = function(object, getter, property) {
    // Use getter method if present; otherwise, get the property directly.
    if (typeof object[getter] === 'function')
      return object[getter]();
    else
      return object[property];
  }

  var setProperty = function(object, setter, property, value) {
    // Use setter method if present; otherwise, set the property directly.
    if (typeof object[setter] === 'function')
      object[setter](value);
    else
      object[property] = value;
  }

  describe('Intent', function() {
    it('should create an instance of Intent', function() {
      // uncomment below and update the code to test Intent
      //var instane = new Zaun.Intent();
      //expect(instance).to.be.a(Zaun.Intent);
    });

    it('should have the property condition (base name: "condition")', function() {
      // uncomment below and update the code to test the property condition
      //var instane = new Zaun.Intent();
      //expect(instance).to.be();
    });

    it('should have the property type (base name: "type")', function() {
      // uncomment below and update the code to test the property type
      //var instane = new Zaun.Intent();
      //expect(instance).to.be();
    });

    it('should have the property classifier (base name: "classifier")', function() {
      // uncomment below and update the code to test the property classifier
      //var instane = new Zaun.Intent();
      //expect(instance).to.be();
    });

    it('should have the property initial (base name: "initial")', function() {
      // uncomment below and update the code to test the property initial
      //var instane = new Zaun.Intent();
      //expect(instance).to.be();
    });

    it('should have the property priority (base name: "priority")', function() {
      // uncomment below and update the code to test the property priority
      //var instane = new Zaun.Intent();
      //expect(instance).to.be();
    });

    it('should have the property fallback (base name: "fallback")', function() {
      // uncomment below and update the code to test the property fallback
      //var instane = new Zaun.Intent();
      //expect(instance).to.be();
    });

    it('should have the property attributes (base name: "attributes")', function() {
      // uncomment below and update the code to test the property attributes
      //var instane = new Zaun.Intent();
      //expect(instance).to.be();
    });

  });

}));
