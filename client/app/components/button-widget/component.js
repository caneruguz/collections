import Ember from 'ember';


export default Ember.Component.extend({

    buttonString: 'Save',

    actions: {
        pressButton() {
            try {
                debugger;
                let result = this.attrs.action();
                this.attrs.saveParamter({
                    value: result,
                    state: ['defined']
                });
            } catch(ex) {
                alert(ex);
            }
        }
    }

});
