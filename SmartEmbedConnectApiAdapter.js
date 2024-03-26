const { SmartEmbedApiAdapter } = require("./SmartEmbedApiAdapter");
class SmartEmbedConnectApiAdapter extends SmartEmbedApiAdapter {
  async embed_batch(items) {
    items = items.filter(item => item.embed_input?.length > 0); // remove items with empty embed_input (causes 400 error)
    if(items.length === 0) return console.log("empty batch (or all items have empty embed_input)");
    // const embed_inputs = items.map(item => {
    //   item.total_tokens = this.count_tokens(item.embed_input);
    //   if(item.total_tokens < this.max_tokens) return item.embed_input;
    //   console.log("total tokens exceeds max_tokens", item.total_tokens);
    //   const truncated_input = this.tokenizer.decode(this.tokenizer.encode(item.embed_input).slice(0, this.max_tokens - 20)) + '...'; // leave room for 200 tokens (buffer)
    //   return truncated_input;
    // });
    const response = await this.request_embedding(embed_inputs);
    if(!response) {
      console.log(items);
    }
    const total_tokens = response.usage.total_tokens;
    const total_chars = items.reduce((acc, item) => acc + item.embed_input.length, 0);
    return items.map((item, i) => {
      item.vec = response[i].vec;
      // item.tokens = Math.round((item.embed_input.length / total_chars) * total_tokens);
      return item;
    });
  }
  async request_embedding(embed_input, retries = 0) {
    const {
      url_first,
    } = this.opts;
    // check if embed_input is empty
    if (embed_input.length === 0) {
      console.log("embed_input is empty");
      return null;
    }
    const body = {
      model_config: this.config,
      input: embed_input,
    };
    const request = {
      url: `http://localhost:37420/embed_batch`,
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${this.api_key}`
      }
    };
    try {
      const args = (url_first) ? [request.url, request] : [request];
      const resp = await this.http_request_adapter(...args);
      const json = (typeof resp.json === 'function') ? await resp.json() : await resp.json;
      if (!json.data) throw resp;
      if (!json.usage) throw resp;
      return json;
    } catch (error) {
      // retry request if error is 429
      if ((error.status === 429) && (retries < 3)) {
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
exports.SmartEmbedConnectApiAdapter = SmartEmbedConnectApiAdapter;