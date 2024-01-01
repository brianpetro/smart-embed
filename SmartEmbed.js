class SmartEmbed {
  static async create() {
    const adapter = new this();
    await adapter.init();
    return adapter;
  }
  async init() { }
  /**
   * @param {string} input
   * @returns {Promise<number>}
   */
  async count_tokens(input) { }
  /**
   * @param {string} input
   * @returns {Promise<number[]>}
   */
  async embed(input) { }
  /**
   * @param {string[]} input
   * @returns {Promise<number[][]>}
   */
  async embed_batch(input) { }
}

exports.SmartEmbed = SmartEmbed;