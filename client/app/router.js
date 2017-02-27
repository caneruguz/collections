import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('index', {path : '/'});
  this.route('collection', {path : 'collection/:collection_id'}, function() {
    this.route('item', {path : 'item/:item_id'});
    this.route('group', {path : 'group/:group_id'}, function() {
      this.route('item', {path : 'item/:group_item_id'});
    });
  });
  this.route('create');
});

export default Router;
