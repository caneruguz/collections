import Ember from 'ember';
import ENV from '../../config/environment';


function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

function getToken() {
    var token;
    var session = window.localStorage['ember_simple_auth:session'];
    if (session) {
        token = JSON.parse(session)['authenticated'];
        if ('attributes' in token) {
            return token['attributes']['accessToken'];
        }
        return token;
    }
}


export default Ember.Controller.extend({


    addMethod: 'select', // 'select' or 'create'
    methodSelected: false,
    type: Ember.computed('model.settings', function() {
        var collectionType = this.get('model.settings.collectionType') || 'project';
        return collectionType.toLowerCase();
    }),


    widgets: [],
    formActions: [],

    // Fire enabled actions.
    updateState: function(actions) {
        actions.forEach((action) => {
            // Check if the action can fire.
            const may_fire = check_all.call(this, action.conditions);
            if (!may_fire) return;
            // Action may fire if execution has reached this point.
            // Call the action and set its result and any
            // changes to its state on `controller.parameters`.
            console.log('stop here');
            action.output_parameter['value'] = action.action.apply(this, action.arg_arr);
            action.output_parameter['state'] = ['defined'];
        });
    },


    // Take the description of an action and set its properties to be the vaious literal
    // functions and parameters it depends on to operate.
    hydrate_action: function(action) {
        const parameters = this.get('parameters');
        if (typeof parameters[action.output_parameter] !== 'object') {
            parameters[action.output_parameter] = {};
        }
        // Create a new object as not to modify the object returned from the model
        const hydrated_action = {
            id: action.id,
            type: action.type,
            signature: this.get(action.type + '_signature'),
            action: this.get(action.type),
            conditions: action.conditions,
            parameters: action.parameters,
            args: action.args,
            output_parameter: parameters[action.output_parameter]
        };
        hydrated_action['arg_arr'] = cons_arg_arr.call(this, hydrated_action);
        return hydrated_action;

    },


    create_widget_signature: ['widget_component', 'description',
                                        'section', 'output_parameter', 'action_id'],
    // `this` must be lexically bound for `create_widget`, as
    // `create_widget` requires access to the controller.
    create_widget: function(widget_component, description, section, output_parameter, action_id) {
        let action;
        if (typeof action_id === "string") {
            action = async (context) => {
                let action_obj = this.get('formActions')
                    // If a user uses the same id for multiple actions,
                    // fire the first that matches.
                    .find(action => action.id == action_id)

                return await action_obj.action.apply(context, action_obj.arg_arr);
            }
        } else {
            action = () => {};
        }
        const widget = {
            widget_component,
            description,
            section,
            output_parameter,
            action
        };
        console.log("\n *** CREATING WIDGET *** \n");
        console.log(widget);
        this.get('widgets').pushObject(widget);
        return widget;
    },


    upload_file_signature: ['file_name', 'file_data', 'node'],
    upload_file: async function(file_name, file_data, node) {
        if (typeof file_name.value === 'undefined') return;
        if (typeof file_data.value === 'undefined') return;
        if (typeof node.value === 'undefined') node.value = ENV.node_guid;
        const uri = ENV.OSF.waterbutlerUrl + "v1/resources/" + node.value +
            "/providers/osfstorage/?kind=file&name=" + file_name.value;
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uri, true);
        xhr.withCredentials = false;
        xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());

        let deferred = Ember.RSVP.defer();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
                deferred.resolve(JSON.parse(xhr.responseText).data.links.download);
            }
        };
        xhr.send(file_data.value);
        let value = await deferred.promise;
        return value
    },


    save_section: function(section) {
        return function() {
            widgets.filter((widget) => {
                return widget.section == section;
            }).map((widget) => {
                return this[widget.output];
            });
        };
    },
    //refresh() {

    //},


    saveParameter(parameter, updated_parameter) {
        parameter.value = updated_parameter.value;
        parameter.state = updated_parameter.state
        this.get('updateState').call(this, this.get('formActions'));
    },


    widgetActions: Ember.computed('widgets.@each.actions', function() {
        return this.get('widgets').map((widget) => {
            widget._action = this.get(widget.action).apply(this, widget.parameters)
        });
    }),


    actions: {

        updateProperty(oldValue, newValue) {
            this.set(oldValue, newValue);
            this.set('methodSelected', true); // Change view to show the methods
        },

        transition(name, id) {
            this.transitionToRoute(name, id);
        },


    }


});



// Engine helper functions.
// ////////////////////////////////////////////////////////////////////////////////////////////////


function condition_dispatcher(condition) {

    const parameters = this.get('parameters');

    // Check if its a regular condition
    if (condition.parameter !== undefined) {
        // actualy check the condition is met;
        // the parameter has to have the given state.
        if (parameters[condition.parameter] === undefined) {
            parameters[condition.parameter] = {};
        }
        if (parameters[condition.parameter].state === undefined) {
            parameters[condition.parameter].state = [];
        }
        const parameter_state = parameters[condition.parameter].state
        // check that the state exists for this item
        return parameter_state.some((state_item) => state_item === condition.state)
    }

    // Check if its an 'all' composite condition
    if (condition.all !== undefined &&
        condition.all.constructor === Array
    ) {
        // if any conditions fail, the whole check fails.
        return check_all.call(this, condition.all);
    }

    // Check if its an 'any' composite condition
    if (condition.any !== undefined &&
        condition.any.constructor === Array
    ) {
        // if any conditions are met, the whole check passes.
        return check_any.call(this, condition.any);
    }

    // Check if its a 'none' composite condition
    if (condition.none !== undefined &&
        condition.none.constructor ===Array
    ) {
        // if any conditions are met, the whole check fails.
        return !check_any.call(this, condition.none);
    }

    return false;

}

function check_all(conditions) {
    const parameters = this.get('parameters');
    if (typeof conditions !== 'object') return false;
    if (conditions.constructor !== Array) return false;
    // if any conditions fail, the whole check fails.
    return !conditions.some(condition => !condition_dispatcher.call(this, condition));
}


function check_any(conditions) {
    // If any conditions are met, the whole check passes.
    return conditions.some(condition_dispatcher.bind(this))
}


function cons_arg_arr(action) {
    const parameters = this.get('parameters');
    let argarr = action.signature.map((key) => {
        // Default to undefined.
        var value = undefined;
        // First try to use the parameter.
        if (typeof action.parameters === 'object' &&
            typeof action.parameters[key] === 'string'
        ) {
            if (typeof parameters[action.parameters[key]] !== 'object') {
                console.log('no parameter, initializing with empty object');
                parameters[action.parameters[key]] = {};
            }
            value = parameters[action.parameters[key]];
        }
        // If an arg is defined, it takes priority.
        if (typeof action.args === 'object' &&
            typeof action.args[key] === 'string'
        ) {
            value = action.args[key];
        }
        return value;
    });
    console.log(argarr);
    return argarr;
}


//
