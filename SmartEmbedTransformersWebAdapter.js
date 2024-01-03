const { md5 } = require('../smart-collections/helpers');
const { SmartEmbed } = require('./SmartEmbed');

class SmartEmbedTransformersWebAdapter extends SmartEmbed {
  constructor() {
    super();
    this.frame = null;
    this.output = {};
    this.response_handlers = {};
  }
  static async create(container, web_script) {
    const adapter = new this();
    adapter.container = container; // iframe container
    adapter.web_script = web_script; // web script to load in iframe
    await adapter.init();
    return adapter;
  }
  unload() {
    console.log("SmartEmbedTransformersWebAdapter Unloading");
    this.remove_frame();
    this.frame = null;
    this.output = {};
    this.response_handlers = {};
  }
  async init() {
    this.frame = this.container.querySelector("#smart_embed_transformers");
    if(!this.frame) {
      this.frame = document.createElement("iframe");
      this.frame.style.display = "none";
      this.frame.style.width = "0";
      this.frame.style.height = "0";
      this.frame.id = "smart_embed_transformers";
      this.frame_loaded = new Promise(resolve => this.frame.onload = resolve); // wait for iframe to load
      const model_loaded = new Promise(resolve => {
        window.addEventListener("message", event => {
          if (event.data.type === "model_loaded"){
            console.log("Model Loaded");
            resolve();
          }
        }, { once: true, capture: false });
      });
      const blob = new Blob([this.iframe_script], { type: 'text/html' });
      this.frame.src = URL.createObjectURL(blob);
      this.container.appendChild(this.frame);
      await this.frame_loaded; // wait for iframe to load
      this.frame.contentWindow.postMessage({ type: "init", model_name: this.model_name }, "*"); // send init message to iframe
      await model_loaded; // wait for model to load
      this.frame.contentWindow.addEventListener("message", this.handle_iframe_messages.bind(this), false);
    }
    // console.log(await this.request_embedding("test"));
    console.log("SmartEmbedTransformersWebAdapter Connected");
  }
  request_embedding(embed_input, retries = 0) {
    if (embed_input.length === 0) return console.log("embed_input is empty"); // check if embed_input is empty
    const handler_id = (typeof embed_input === "string") ? embed_input : md5(JSON.stringify(embed_input));
    this.frame.contentWindow.postMessage({ type: "smart_embed", embed_input, handler_id }, "*");
    return new Promise((resolve, reject) => {
      this.response_handlers[handler_id] = ({ error, data }) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(data);
        }
      };
      setTimeout(() => {
        if (this.response_handlers[handler_id]) {
          reject(new Error("Timeout waiting for response"));
          delete this.response_handlers[handler_id];
        }
      }, 60000);
    });
  }
  async embed_batch(items) {
    const resp = await this.request_embedding(items.map(item => ({ embed_input: item.embed_input })));
    return items.map((item, i) => {
      const resp_item = resp.data[i];
      item.vec = resp_item.vec;
      item.tokens = resp_item.tokens;
      return item;
    });
  }
  embed(input) { return this.request_embedding(input); }
  count_tokens(input, timeout = 60000) {
    this.frame.contentWindow.postMessage({ type: "smart_embed_token_ct", embed_input: input }, "*");
    return new Promise((resolve, reject) => {
      this.response_handlers["count:" + input] = ({ error, data }) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(data);
        }
      };
      setTimeout(() => {
        if (this.response_handlers["count:" + input]) {
          reject(new Error("Timeout waiting for response"));
          delete this.response_handlers["count:" + input];
        }
      }, timeout);
    });
  }
  get iframe_script() { return `<script type="module">${this.web_script}</script>`; }
  get is_embedding() { return Object.keys(this.response_handlers).length > 0; }
  get queue_length() { return Object.keys(this.response_handlers).length; }
  remove_frame() {
    if (this.frame) this.frame.remove();
    const frame_check = this.container.querySelector("#smart_embed_transformers");
    if (frame_check) frame_check.remove();
    console.log("SmartEmbedTransformersWebAdapter Disconnected");
  }
  handle_iframe_messages(event) {
    if (event.data.type === "smart_embed_resp" || event.data.type === "smart_embed_token_ct") {
      const handler = this.response_handlers[event.data.handler_id || event.data.text];
      if (handler) {
        handler({ error: null, data: event.data });
        delete this.response_handlers[event.data.handler_id || event.data.text];
      }
    }
  }
}
exports.SmartEmbedTransformersWebAdapter = SmartEmbedTransformersWebAdapter;
