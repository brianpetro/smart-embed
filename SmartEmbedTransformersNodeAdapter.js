const { SmartEmbed } = require("./SmartEmbed");

class SmartEmbedTransformersNodeAdapter extends SmartEmbed {
  async init(model_name = 'Xenova/bge-small-en-v1.5') {
    const { env, pipeline, AutoTokenizer } = await import('@xenova/transformers');
    env.allowLocalModels = false;
    this.model = await pipeline('feature-extraction', model_name, { quantized: true });
    this.tokenizer = await AutoTokenizer.from_pretrained(model_name); // bge
  }
  async embed_batch(items) {
    const tokens = await Promise.all(items.map(item => this.count_tokens(item.embed_input)));
    const embed_input = items.map((item, i) => {
      if (tokens[i] < 512) return item.embed_input;
      const pct = 512 / tokens[i]; // get pct of input to keep
      const max_chars = Math.floor(item.embed_input.length * pct * 0.95); // get number of characters to keep (minus 5% for safety)
      return item.embed_input.substring(0, max_chars) + "...";
    });
    // console.log(embed_input);
    try{
      const resp = await this.model(embed_input, { pooling: 'mean', normalize: true });
      // console.log(resp);
      return items.map((item, i) => {
        item.vec = Array.from(resp[i].data);
        item.tokens = item.embed_input.length;
        return item;
      });
    }catch(err){
      console.log(err);
      console.log("Error embedding batch. Trying one at a time...");
    }
    return await Promise.all(items.map(async item => {
      const { vec, tokens, error } = await this.embed(item.embed_input);
      if(error){
        console.log("Error embedding item: ", item.key);
        console.log(error);
        item.error = error;
        return item;
      }
      item.vec = vec;
      item.tokens = tokens;
      return item;
    }));
  }
  async embed(input) {
    const output = { text: input };
    if (!input) return { ...output, error: "No input text." };
    if (!this.model) await this.init();
    try {
      output.tokens = await this.count_tokens(input);
      if (output.tokens < 1) return { ...output, error: "Input too short." };
      if (output.tokens < 512) {
        const embedding = await this.model(input, { pooling: 'mean', normalize: true });
        output.vec = Array.from(embedding.data);
      } else {
        const pct = 512 / output.tokens; // get pct of input to keep
        const max_chars = Math.floor(input.length * pct * 0.95); // get number of characters to keep (minus 5% for safety)
        input = input.substring(0, max_chars) + "...";
        output.truncated = true;
        console.log("Input too long. Truncating to ", input.length, " characters.");
        const { vec, tokens } = await this.embed(input);
        output.vec = vec;
        output.tokens = tokens;
      }
      return output;
    } catch (err) {
      console.log(err);
      return { ...output, error: err.message };
    }
  }
  async count_tokens(text) {
    if (!this.tokenizer) await this.init();
    const { input_ids } = await this.tokenizer(text);
    return input_ids.data.length; // Return the number of tokens
  }
}

exports.SmartEmbedTransformersNodeAdapter = SmartEmbedTransformersNodeAdapter;