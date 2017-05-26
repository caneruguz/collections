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
    panelActions: Ember.inject.service('panelActions'),
    _names: Ember.computed('sections', function() {
        let sections = this.get('sections');
        return sections.map((section) => {
            return section.name;
        });
    }),
    methodSelected: false,
    type: Ember.computed('model.settings', function() {
        var collectionType = this.get('model.settings.collectionType') || 'project';
        return collectionType.toLowerCase();
    }),
    widgets: [],
    formActions: [],
    editMode: false,

    init: function () {
        this._super();
        this.set('content', Em.Object.create({
            info: null
        }));
        this.saveParameter = this.saveParameter.bind(this);
    },

    // Fire enabled actions.
    updateState: function(actions) {
        actions.forEach((action) => {
            // Check if the action can fire.
            const may_fire = check_all.call(this, action.conditions);
            if (!may_fire) return;
            // Action may fire if execution has reached this point.
            // Call the action and set its result and any
            // changes to its state on `controller.parameters`.
            console.log('Firing action: ' + action.type);
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
            output_parameter: parameters[action.output_parameter],
            then: action.then
        };
        hydrated_action['arg_arr'] = cons_arg_arr.call(this, hydrated_action);
        return hydrated_action;

    },


    create_widget_signature: ['widget_component', 'description',
                                        'section', 'output_parameter', 'action_id', 'options'],
    // `this` must be bound to the controller for `create_widget`, as
    // `create_widget` requires access to the controller, and does so through `this`.
    create_widget: function(widget_component, description, section, output_parameter, action_id, options) {
        let action;

        let actions = this.get('formActions');

        async function fire_actions(action_id) {
            if (typeof action_id === "string") {

                let action_obj = actions.find(action => action.id == action_id);
                if (typeof action_obj.action === 'function') {
                    let result = await action_obj.action.apply(this, action_obj.arg_arr);
                    if (typeof action_obj.then === 'string') {
                        fire_actions.call(this, action_obj.then);
                    }
                    return result;
                }
            } else {
                return;
            }
        }

        action = (context) => fire_actions.call(context, action_id);

        const widget = {
            widget_component,
            description,
            section,
            output_parameter,
            action,
            options
        };
        this.get('widgets').pushObject(widget);
        return widget;
    },


    // Delete widget and resets state
    delete_widget_signature: ['widget_object'],
    delete_widget: function(widget_object) {
        this.get('widgets').removeObject(widget_object.value);
        widget_object.value = undefined;
        widget_object.state = ['undefined'];
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
    saveParameter_signature: ['parameter', 'updated_parameter'],
    saveParameter: function(parameter, updated_parameter) {
        if (typeof updated_parameter.value !== undefined) {
            parameter.value = updated_parameter.value;
        }
        if (typeof updated_parameter.state !== undefined) {
            parameter.state = updated_parameter.state;
        }
        this.get('updateState').call(this, this.get('formActions'));
    },


    widgetActions: Ember.computed('widgets.@each.actions', function() {
        return this.get('widgets').map((widget) => {
            widget.action = this.get(widget.action).apply(this, widget.parameters);
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

        closeSection(currentPanelName) {
            this.get('panelActions').close(this.get(`_names.${this.get('_names').indexOf(currentPanelName)}`));
        }

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
            action.args[key] !== undefined
        ) {
            value = action.args[key];
        }
        return value;
    });
    console.log(argarr);
    return argarr;
}


//
