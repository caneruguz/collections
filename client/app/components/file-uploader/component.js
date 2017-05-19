import Ember from 'ember';
//import ENV from 'analytics-dashboard/config/environment';

function getToken() {
    const session = window.localStorage['ember_simple_auth:session'];
    if (session) {
        const token = JSON.parse(session)['authenticated'];
        if ('attributes' in token) {
            return token['attributes']['accessToken'];
        }
        return token;
    }
}

export default Ember.Component.extend({

    actions: {

        uploadFile: function(ev) {

            debugger;
            const reader = new FileReader();
            const file_handle = ev.target.files[0];
            const saveParameter = this.attrs.saveParameter

            reader.onloadend = function(ev) {
                saveParameter({
                    state: ['defined'],
                    value: ev.target.result
                });
            };

            reader.readAsBinaryString(file_handle);
        }
    }

});
