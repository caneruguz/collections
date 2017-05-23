import Ember from 'ember';


export default Ember.Component.extend({

    buttonString: 'Save',

    actions: {
        async pressButton() {
            //try {
                let result = await this.get('action')();
                console.log(result);
                this.attrs.saveParameter({
                    value: result,
                    state: ['defined']
                });
            //} catch(ex) {
            //    alert(ex);
            //}
        }
    }

});
