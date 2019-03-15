import Misprints from '@codexteam/misprints';
import Reactions from '@codexteam/reactions';

/**
 * @class Extensions
 * @classdesc Class for extensions module
 */
export default class Extensions {
  /**
   * Initialize extensions
   */
  constructor() {
    this.misprints = new Misprints({
      chatId: window.config.misprintsChatId
    });

    if (document.querySelector(window.config.reactions.parent)) {
      this.reactions = new Reactions(window.config.reactions);
    }
  }
}
