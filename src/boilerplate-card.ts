import { LitElement, html, customElement, property, CSSResult, TemplateResult, css, PropertyValues } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { HomeAssistant, hasConfigOrEntityChanged, LovelaceCardEditor, getLovelace } from 'custom-card-helpers';

import { BoilerplateCardConfig } from './types';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  BOILERPLATE-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// TODO Name your custom element
@customElement('boilerplate-card')
export class BoilerplateCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('boilerplate-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  @property() public hass?: HomeAssistant;
  @property() private _config?: BoilerplateCardConfig;

  public setConfig(config: BoilerplateCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config || !config.entity) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this._config = {
      name: 'Boilerplate',
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (!stateObj) {
      return html`
        <ha-card>
          <div class="warning">${localize('common.show_warning')}</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card tabindex="0" aria-label=${`Boilerplate: ${this._config.entity}`}>
        <paper-tabs
          attr-for-selected="zone"
          selected="${stateObj.state}"
          scrollable
          @selected-item-changed=${this._selectedChanged}
        >
          ${repeat(
            stateObj.attributes.options,
            option =>
              html`
                <paper-tab zone="${option}">${option}</paper-tab>
              `,
          )}
        </paper-tabs>
      </ha-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }
      paper-tabs {
        --paper-tabs-selection-bar-color: var(--primary-color);
      }
    `;
  }

  private _selectedChanged(ev): void {
    const stateObj = this.hass!.states[this._config!.entity];
    const option = ev.target.selected.trim();
    if (option === stateObj.state) {
      return;
    }

    this.hass!.callService('input_select', 'select_option', {
      option,
      entity_id: stateObj.entity_id,
    });
  }
}
