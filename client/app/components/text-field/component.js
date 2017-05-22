import Ember from 'ember';


export default Ember.Component.extend({

    description: "Enter a title for the preprint.",

    textFieldValueObserver: Ember.observer('textFieldValue', function() {

        this.attrs.saveParameter({
            state: ['defined'],
            value: this.get('textFieldValue')
        })

    }),

});
