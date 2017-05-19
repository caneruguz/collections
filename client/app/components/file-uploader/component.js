import Ember from 'ember';
//import ENV from 'analytics-dashboard/config/environment';

export default Ember.Component.extend({

    actions: {

        uploadFile: function(ev) {

            const reader = new FileReader();
            const file_handle = ev.target.files[0];
            const saveParameter = this.attrs.saveParameter

            reader.onloadend = function(ev) {
                saveParameter({
                    value: ev.target.result,
                    state: ['defined']
                });
            };

            reader.readAsBinaryString(file_handle);
        }
    }

});
