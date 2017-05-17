import Ember from 'ember';

export default Ember.Route.extend({
    model(){
        let model = {};
        this.store.findRecord('node', 'h4wub').then((result)=>{
            model.node = result;
        });
        return model;
    }
});
