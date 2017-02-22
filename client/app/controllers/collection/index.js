import Ember from 'ember';

export default Ember.Controller.extend({
    loadingGuid: false,
    organizeMode: false,
    selectedItems : Ember.A(), // List of items selected for actions like delete
    showDeleteConfirmation: false, // Modal for deleting items
    showGroupConfirmation: false, // Modal for grouping
    groupTitle: '',
    groups: Ember.computed('model.groups', function() {
      let groups = this.get('model.groups');
      groups.forEach(function(group) {
        group.set('type', 'group');
      });
      return groups;
    }),
    tableView: false,
    list: Ember.computed.union('groups', 'model.items'),
    actions: {
        toggleOrganizeMode () {
            this.toggleProperty('organizeMode');
        },
        toggleDeleteConfirmation(){
            this.toggleProperty('showDeleteConfirmation');
        },
        clearSelected() {
            let selected = this.get('selectedItems');
            selected.clear();
        },
        clearModals() {
            this.set('showGroupConfirmation', false);
            this.set('showDeleteConfirmation', false);
            this.set('groupTitle', '');
        },
        deleteSelected(){
            let items = this.get('list');
            let selected = this.get('selectedItems');
            selected.forEach(item =>
                Ember.run.once(() =>
                  item.destroyRecord()
            ));
            items.removeObjects(selected);
            this.send('clearSelected');
            this.send('clearModals');
        },
        toggleGroupConfirmation ( ){
            this.toggleProperty('showGroupConfirmation');
        },
        groupSelected(){
            // Create new group
            let newGroup = this.get('store').createRecord('group', {
                title: this.get('groupTitle'),
                description: '',
                collection: this.get('model')
            });
            newGroup.save().then((record) => {
                // For each item, set group to new group
                let selected = this.get('selectedItems');
                selected.forEach(item => {
                    item.set('group', record);
                    item.save();
                });

                // remove items that were put into the group;
                let list = this.get('list');
                list.removeObjects(selected);
                this.send('clearSelected');
                this.send('clearModals');
            });
        },
        // Adds or removes item to the selectedItems list
        toggleSelectedList(selected, item){
            let currentList = this.get('selectedItems');
            if(!selected){
                currentList.removeObject(item);
            } else {
                currentList.addObject(item);
            }

        },
        addToList(){
            let nodeObject = this.get('newItemNode');
            let item = this.store.createRecord('item', {
                title: nodeObject.get('title'),
                type: nodeObject.get('type'),
                metadata: '',
                status: 'pending',
                url: nodeObject.get('link'),
                source_id: nodeObject.get('source_id'),
                collection : this.get('model')
            });
            item.save();
            this.set('showAddItemDetails', false);
        },
        changeRoute(path){
            this.transitionToRoute(path);
        }
    }
});
