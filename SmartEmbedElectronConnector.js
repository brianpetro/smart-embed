const { ipcRenderer } = require('electron');
const { SmartEmbed } = require('./SmartEmbed');
class SmartEmbedElectronConnector extends SmartEmbed {
  async init(){
    await ipcRenderer.invoke('smart-embed-init', this.model_config_key);
  }
  // embed_batch(items) { return ipcRenderer.invoke('smart-embed-batch', items); }
  async embed_batch(items) {
    items = items.filter(item => item.embed_input?.length > 0);
    if(!items?.length) return [];
    // const resp = await this.request_embedding(items.map(item => ({ embed_input: item.embed_input })));
    if(!this.timestamp) this.timestamp = Date.now();
    const resp = await ipcRenderer.invoke('smart-embed-batch', items.map(item => ({ embed_input: item.embed_input })));
    this.tokens += resp.reduce((acc, item) => acc + item.tokens, 0);
    const batch_time = Date.now() - this.timestamp;
    if(batch_time > 10000){
      this.timestamp = null;
      console.log("Batch time: ", batch_time, "ms");
      // tokens per second
      console.log("Tokens per second: ", (this.tokens / (batch_time / 1000)).toFixed(0));
      this.tokens = 0;
    }
    return items.map((item, i) => {
      const resp_item = resp[i];
      item.vec = resp_item.vec;
      item.tokens = resp_item.tokens;
      return item;
    });
  }
  embed(input) { return ipcRenderer.invoke('smart-embed', input); }
  count_tokens(input) { return ipcRenderer.invoke('smart-embed-token-ct', input); }
}
exports.SmartEmbedElectronConnector = SmartEmbedElectronConnector;