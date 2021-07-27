import Misprints from '@codexteam/misprints';

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
      chatId: window.config.misprintsChatId,
    });
  }
}
