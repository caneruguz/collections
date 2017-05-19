import Ember from 'ember';


export default Ember.Component.extend({

    buttonString: 'Save',

    actions: {
        pressButton() {
            try {
                let result = this.get('action')();
                this.attrs.saveParameter({
                    value: result,
                    state: ['defined']
                });
            } catch(ex) {
                alert(ex);
            }
        }
    }

});
