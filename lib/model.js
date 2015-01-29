/**
 * Created by egor on 24.12.14.
 */
'use strict';
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;


var History = new Schema({
  created: { type: Date, default: Date.now, required: true },
  collection_name: { type: String, required: true },
  key: { type: String, enum: ['delete', 'update', 'create'], required: true },
  item_id: { type: Schema.Types.ObjectId, ref: 'User', required: true},
  object: {},
  changed_fields:  [new Schema({
    field_name: String,
    old_value: Schema.Types.Mixed
  },{ _id : false })]
});

History.pre('save', function(next){
  if(this.key === 'create' || this.key === 'delete'){
    this.changed_fields = undefined;
  }
  next();
});

module.exports = mongoose.model('History', History);