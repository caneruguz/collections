import Ember from 'ember';
import NodeActionsMixin from 'ember-osf/mixins/node-actions';

export default Ember.Controller.extend(NodeActionsMixin, {
    user: Ember.inject.service('currentUser'),
    //currentUser: Ember.inject.service(),
    addMethod: 'select', // 'select' or 'create'
    methodSelected: false,
     toast: Ember.inject.service('toast'),
    type: Ember.computed('model.settings', function() {
        var collectionType = this.get('model.settings.collectionType') || 'project';
        return collectionType.toLowerCase();
    }),
    parentContributors: Ember.A(),
    node: Ember.computed('model', function(){
        return this.get('model.node');
    }),
    contributors: Ember.computed('model', function(){
        console.log(this.get('model'));
        return this.get('model.node.contributors');
    }),
    actions:{
        updateProperty(oldValue, newValue){
            this.set(oldValue, newValue);
            this.set('methodSelected', true); // Change view to show the methods
        },
        transition(name, id){
            this.transitionToRoute(name, id);
        },
        /**
         * findContributors method.  Queries APIv2 users endpoint on any of a set of name fields.  Fetches specified page of results.
         *
         * @method findContributors
         * @param {String} query ID of user that will be a contributor on the node
         * @param {Integer} page Page number of results requested
         * @return {User[]} Returns specified page of user records matching query
         */
        findContributors(query, page) {
              return this.store.query('user', {
                  filter: {
                    'full_name,given_name,middle_names,family_name': query
                  },
                  page: page
                }).then((contributors) => {
                  this.set('searchResults', contributors);
              return contributors;
            }).catch(() => {
                this.get('toast').error(this.get('i18n').t('submit.search_contributors_error'));
              this.highlightSuccessOrFailure('author-search-box', this, 'error');
            });
        },
        /**
        * highlightSuccessOrFailure method. Element with specified ID flashes green or red depending on response success.
        *
        * @method highlightSuccessOrFailure
        * @param {string} elementId Element ID to change color
        * @param {Object} context "this" scope
        * @param {string} status "success" or "error"
        */
        highlightSuccessOrFailure(elementId, context, status) {
            const highlightClass = `${status === 'success' ? 'success' : 'error'}Highlight`;

            context.$('#' + elementId).addClass(highlightClass);

            Ember.run.later(() => context.$('#' + elementId).removeClass(highlightClass), 2000);
        }
    },
    init (){

    }
});
