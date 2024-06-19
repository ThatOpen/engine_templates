/* eslint-disable no-restricted-globals */
import * as BUI from "@thatopen/ui";

export default BUI.Component.create<BUI.Panel>(() => {
  return BUI.html`
    <bim-panel>
      <bim-panel-section fixed label="That Open People at your disposal" icon="ic:baseline-people">
        <bim-label style="white-space: normal;">Feel stuck? Within our community, That Open People, you'll find all the answers to your doubts and the place where "openers" meet, learn, grow and build the open future together.</bim-label>
        <bim-button @click=${() => open("https://people.thatopen.com/")} label="Meet That Open People" icon="ic:baseline-people"></bim-button>
      </bim-panel-section>
      <bim-panel-section fixed label="Become a BIM Software Developer" icon="mdi:university">
        <bim-label style="white-space: normal;">Want a career change? Enter this new market full of opportunities! Go step-by-step from zero to hero in becoming a BIM Software Developer to make a successful career out of it.</bim-label>
        <bim-button @click=${() => open("https://thatopen.com/master")} label="Join To Master" icon="mdi:university"></bim-button>
      </bim-panel-section>
      <bim-panel-section fixed label="Get The Code and Boost your Career" icon="material-symbols:code">
        <bim-label style="white-space: normal;">Eager to succeed? Sign up for Get The Code, our premium membership where you will get all the resources you need to succeed as a BIM Software Developer in the long term and where you can start making money from day one.</bim-label>
        <bim-button @click=${() => open("https://thatopen.com/get-the-code")} label="Get The Code" icon="material-symbols:code"></bim-button>
      </bim-panel-section>
    </bim-panel>
  `;
});
