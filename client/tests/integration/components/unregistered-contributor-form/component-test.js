import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('unregistered-contributor-form', 'Integration | Component | unregistered contributor form', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{unregistered-contributor-form}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#unregistered-contributor-form}}
      template block text
    {{/unregistered-contributor-form}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
