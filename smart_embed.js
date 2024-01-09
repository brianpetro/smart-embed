/*
 * Copyright (c) Brian Joseph Petro (WFH Brian)
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const { SmartEmbed } = require("./SmartEmbed");
const { SmartEmbedTransformersNodeAdapter } = require("./SmartEmbedTransformersNodeAdapter");
const { SmartEmbedTransformersWebAdapter } = require("./SmartEmbedTransformersWebAdapter");
class SmartEmbedApiAdapter extends SmartEmbed {
  static async create(http_request_adapter, api_key, opts = {}) {
    const adapter = new this();
    adapter.http_request_adapter = http_request_adapter;
    adapter.api_key = api_key;
    adapter.opts = opts;
    await adapter.init();
    return adapter;
  }
}
// const { encoding_for_model } = require("tiktoken"); // issues with esbuild
class SmartEmbedOpenAIAdapter extends SmartEmbedApiAdapter {
  async count_tokens(input) {
    return this.tokenizer.encode(input).length;
  }
  async embed(input) {
    const response = await this.request_embedding(input);
    const vec = response.data[0].embedding;
    const tokens = response.usage.total_tokens;
    return { vec, tokens };
  }
  async embed_batch(items) {
    const response = await this.request_embedding(items.map(item => item.embed_input));
    const total_tokens = response.usage.total_tokens;
    const total_chars = items.reduce((acc, item) => acc + item.embed_input.length, 0);
    return items.map((item, i) => {
      item.vec = response.data[i].embedding;
      item.tokens = Math.round((item.embed_input.length / total_chars) * total_tokens);
      return item;
    });
  }
  async request_embedding(embed_input, retries = 0) {
    const {
      url_first,
    } = this.opts;
    // check if embed_input is empty
    if(embed_input.length === 0) {
      console.log("embed_input is empty");
      return null;
    }
    const body = {
      model: this.model_name,
      input: embed_input,
    };
    const request = {
      url: `https://api.openai.com/v1/embeddings`,
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.api_key}`
      }
    };
    try {
      const args = (url_first) ? [request.url, request] : [request];
      const resp = await this.http_request_adapter(...args);
      const json = (typeof resp.json === 'function') ? await resp.json() : await resp.json;
      if(!json.data) throw resp;
      if(!json.usage) throw resp;
      return json;
    } catch (error) {
      // retry request if error is 429
      if((error.status === 429) && (retries < 3)) {
        const backoff = Math.pow(retries + 1, 2); // exponential backoff
        console.log(`retrying request (429) in ${backoff} seconds...`);
        await new Promise(r => setTimeout(r, 1000 * backoff));
        return await this.request_embedding(embed_input, retries + 1);
      }
      console.log(error);
      return null; 
    }
  }
}
class SmartEmbedAdaApi extends SmartEmbedOpenAIAdapter {
  get model_name() { return "text-embedding-ada-002"; }
  get batch_size() { return 50; }
  get dims() { return 1536; }
}
class SmartEmbedBgeSmallWeb extends SmartEmbedTransformersWebAdapter {
  get model_name() { return "Xenova/bge-small-en-v1.5"; }
  get batch_size() { return 5; }
  get dims() { return 384; }
}
class SmartEmbedBgeSmallNode extends SmartEmbedTransformersNodeAdapter {
  get model_name() { return "Xenova/bge-small-en-v1.5"; }
  get batch_size() { return 5; }
  get dims() { return 384; }
}
exports.SmartEmbedAdaApi = SmartEmbedAdaApi;
exports.SmartEmbedBgeSmallNode = SmartEmbedBgeSmallNode;
exports.SmartEmbedBgeSmallWeb = SmartEmbedBgeSmallWeb;