import Ember from 'ember';
import fixSpecialChar from 'ember-osf/utils/fix-special-char';
import { validator, buildValidations } from 'ember-cp-validations';
import ENV from '../../config/environment';

// Form data and validations
const BasicsValidations = buildValidations({
    basicsAbstract: {
        description: 'Abstract',
        validators: [
            validator('presence', true),
            validator('length', {
                // currently min of 20 characters -- this is what arXiv has as the minimum length of an abstract
                min: 20,
                max: 5000
            })
        ]
    },
    basicsDOI: {
        description: 'DOI',
        validators: [
            validator('format', {
                // Simplest regex- try not to diverge too much from the backend
                regex: /\b(10\.\d{4,}(?:\.\d+)*\/\S+(?:(?!["&\'<>])\S))\b/,
                allowBlank: true,
                message: 'Please use a valid {description}'
            })
        ]
    }
});

function doiRegexExec(doi) {
    //Strips url out of inputted doi, if any.  For example, user input this DOI: https://dx.doi.org/10.12345/hello. Returns 10.12345/hello.
    // If doi invalid, returns doi.
    const doiRegex = /\b(10\.\d{4,}(?:\.\d+)*\/\S+(?:(?!["&\'<>])\S))\b/;
    if (doi) {
        const doiOnly = doiRegex.exec(doi);
        return doiOnly !== null ? doiOnly[0] : doi;
    }
    return doi;

}

/* Does not support editing */
export default Ember.Component.extend(BasicsValidations, {
  store: Ember.inject.service(),
    editMode: true,
    uploadValid: Ember.computed.alias('nodeLocked'), // Once the node has been locked (happens in step one of upload section), users are free to navigate through form unrestricted
    abstractValid: Ember.computed.alias('validations.attrs.basicsAbstract.isValid'),
    doiValid: Ember.computed.alias('validations.attrs.basicsDOI.isValid'),
    // Must have year and copyrightHolders filled if those are required by the licenseType selected
    licenseValid: false,

    // Look for changes in form, assumes no existing changes loaded TODO: Add editing existing node use case
    // savedValues: {}, // filled with saveBasics
    // formChanged:  Ember.computed('basicsDOI', 'basicsLicense', 'basicsTags', 'basicsAbstract', function() {
    //   let saved = this.get('savedValues');
    //   // doi
    //   let doiChanged = saved.basicsDOI ? saved.basicsDOI !== this.get('basicsDOI') : true ;
    //   let licenseChanged = saved.basicsLicense ? saved.basicsLicense !== this.get('basicsLicense') : true ;
    //   let abstractChanged = saved.basicsAbstract ? saved.basicsAbstract !== this.get('basicsAbstract') : true ;
    //   let tagsChanged = saved.basicsTags ? saved.basicsTags.some((v,i) => v !== this.get('basicsTags')[i])  : true ;
    //
    //   return doiChanged || licenseChanged || abstractChanged || tagsChanged;
    // }),
    basicsChanged: Ember.computed.or('tagsChanged', 'abstractChanged', 'doiChanged'),// 'licenseChanged'),
    doiChanged: Ember.computed('node.doi', 'basicsDOI', function() {
        // Does the pending DOI differ from the saved DOI in the db?
        // If pending DOI and saved DOI are both falsy values, doi has not changed.
        const basicsDOI = doiRegexExec(this.get('basicsDOI'));
        const modelDOI = this.get('node.doi');
        return (basicsDOI || modelDOI) && basicsDOI !== modelDOI;
      }),
    licenseChanged: Ember.computed('node.license', 'node.licenseRecord', 'basicsLicense.year', 'basicsLicense.copyrightHolders', 'basicsLicense.licenseType', function() {
      let changed = false;
      if (this.get('node.licenseRecord') || this.get('node.license.content')) {
        changed |= (this.get('node.license.name') !== this.get('basicsLicense.licenseType.name'));
        changed |= (this.get('node.licenseRecord').year !== this.get('basicsLicense.year'));
        changed |= ((this.get('node.licenseRecord.copyright_holders.length') ? this.get('model.licenseRecord.copyright_holders').join(', ') : '') !== this.get('basicsLicense.copyrightHolders'));
      } else {
        changed |= ((this.get('availableLicenses').toArray().length ? this.get('availableLicenses').toArray()[0].get('name') : null) !== this.get('basicsLicense.licenseType.name'));
        changed |= ((new Date()).getUTCFullYear().toString() !== this.get('basicsLicense.year'));
        changed |= !(this.get('basicsLicense.copyrightHolders') === '' || !this.get('basicsLicense.copyrightHolders.length') || this.get('basicsLicense.copyrightHolders') === null);
      }

      return changed;
    }),
    tagsChanged: Ember.computed('basicsTags.@each', 'node.tags', function() {
      const basicsTags = this.get('basicsTags');
      const nodeTags = this.get('node.tags');

      return basicsTags && nodeTags &&
        (
          basicsTags.length !== nodeTags.length ||
          basicsTags.some(
            (v, i) => fixSpecialChar(v) !== fixSpecialChar(nodeTags[i])
          )
        );
    }),
    abstractChanged: Ember.computed('basicsAbstract', 'node.description', function() {
      let basicsAbstract = this.get('basicsAbstract');
      return basicsAbstract !== null && basicsAbstract.trim() !== this.get('node.description').trim();
    }),

    // Basics fields that are being validated are abstract, license and doi (title validated in upload section). If validation added for other fields, expand basicsValid definition.
    basicsValid: Ember.computed.and('abstractValid', 'doiValid', 'licenseValid'),
    basicsAbstract:  Ember.computed('node.description', function() {
        let node = this.get('node');
        return node ? node.get('description') : null;
    }),

    // Pending tags
    basicsTags: Ember.computed('node', function() {
        const node = this.get('node');
        return node ? node.get('tags').map(fixSpecialChar) : Ember.A();
    }),
    basicsDOI: null,
    basicsLicense: null,
    actions: {
        addTag(tag) {
            this.get('basicsTags').pushObject(tag);
        },
        removeTag(tag) {
            this.get('basicsTags').removeObject(tag);
        },
        applyLicenseToggle(apply) {
            this.set('applyLicense', apply);
        },
        discardBasics() {
            // Discards changes to basic fields. (No requests sent, front-end only.)
            this.set('basicsTags', this.get('node.tags').map(fixSpecialChar));
            this.set('basicsAbstract', this.get('node.description'));
            this.set('basicsDOI', null);
            this.set('basicsLicense', null);
        },
        preventDefault(e) {
            e.preventDefault();
        },
        stripDOI() {
            // Replaces the inputted doi link with just the doi itself
            let basicsDOI = this.get('basicsDOI');
            this.set('basicsDOI', doiRegexExec(basicsDOI));
        },
        editLicense(basicsLicense, licenseValid) {
           this.setProperties({
               basicsLicense,
               licenseValid
           });
           this.set('initialLicenseChangeMade', true);
       },
       saveBasics() {
            // Saves the description/tags on the node and the DOI on the preprint, then advances to next panel
            if (!this.get('basicsValid')) {
                return;
            }
            debugger;
            this.attrs.saveParameter({
                value: this.get('basicsAbstract'),
                state: ['defined']
            });
            // this.savedValues.set({
            //   basicsDOI: this.get('basicsDOI'),
            //   basicsLicense: this.get('basicsLicense'),
            //   basicsTags: this.get('basicsTags'),
            //   basicsAbstract: this.get('basicsAbstract')
            // });
            this.set('editMode', false);
            this.sendAction('closeSection', this.get('name'));

            const node = this.get('node');
            node.set('tags', this.get('basicsTags'));
            node.set('description', this.get('basicsAbstract'));

            node.save()
                .then(() => console.log('saved'))
                // If save fails, do not transition
                .catch(() => {
                    this.get('toast').error(
                        this.get('i18n').t('submit.basics_error')
                    );

                    // model.setProperties({
                    //     licenseRecord: currentLicenseRecord,
                    //     license: currentLicenseType,
                    //     doi: currentDOI,
                    // });
                    //
                    // node.setProperties({
                    //     description: currentAbstract,
                    //     tags: currentTags,
                    //     license: currentNodeLicenseType,
                    //     nodeLicense: currentNodeLicenseRecord,
                    // });
                    //
                    // return Promise.all([
                    //     node.save(),
                    //     model.save()
                    // ]);
                });
        },
    },
    init(){
        this._super(...arguments);
        this.get('store').findRecord('node', ENV.node_guid).then((result)=>{
          this.set('node', result);
        });
    },
});
