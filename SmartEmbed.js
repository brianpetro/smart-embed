const models = require('./models');
class SmartEmbed {
  constructor(model_config_key) {
    this.model_config_key = model_config_key;
    this.config = models[this.model_config_key];
  }
  static async create(model_config_key, ...args) {
    const adapter = new this(model_config_key, ...args);
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
  get batch_size() { return this.config.batch_size; }
  get dims() { return this.config.dims; }
  get model_name() { return this.config.model_name; }
}

exports.SmartEmbed = SmartEmbed;