import Ember from 'ember';

export default Ember.Route.extend({
    currentUser: Ember.inject.service(),
    model(){
        let model = {};
        this.store.findRecord('node', 'h4wub').then((result)=>{
            model.node = result;
        });
        return model;
    }
});
