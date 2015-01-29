/**
 * Created by egor on 24.12.14.
 */
'use strict';
var HistoryModel = require('./model')
  , debug = require('debug')('history');

var createRecord = function (object, next) {

  var history = new HistoryModel(object);

  history.save(function (err) {
    if (err) {
      debug('can\'t save history ' + err);
      next(err);
    }
    next();
  });
};

module.exports = function historyPlugin(schema) {

  schema.virtual('___history___').set(function (hash) {
    if (!this.__history_store__) {
      this.__history_store__ = [];
    }

    this.__history_store__.push(hash);
  }).get(function () {
    return this.__history_store__;
  });

  schema.pre('set', function (next, value) {
    if(typeof value  === 'string' && value !== '___history___'){
      var new_value = this.get(value);
      if(new_value !== value){
        var hash = {};
        hash.field_name = value;
        hash.old_value = new_value;
        this.___history___ = hash;
      }
    }
    next();
  });

  schema.pre('save', function (next) {
    var hystoryObj = {};
    hystoryObj.fields = {};
    hystoryObj.collection_name = this.collection.name;
    if (!this.isNew) {
      hystoryObj.changed_fields = this.___history___;
      hystoryObj.key = 'update';
    } else {
      hystoryObj.key = 'create';
    }
    hystoryObj.object = this.toObject();
    hystoryObj.item_id = this.id;
    createRecord(hystoryObj, next);
  });

  schema.pre('remove', function (next) {
    var hystoryObj = {};
    hystoryObj.collection_name = this.collection.name;
    hystoryObj.key = 'delete';
    hystoryObj.item_id = this.id;
    hystoryObj.object = this.toObject();
    createRecord(hystoryObj, next);
  });
};
