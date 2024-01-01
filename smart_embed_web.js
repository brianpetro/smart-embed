window.addEventListener('message', init); // listen for init message
async function init(event) {
  if (event.data.type === 'init') {
    window.removeEventListener('message', init); // remove this event listener
    const model_name = event.data.model_name;
    const { SmartEmbedTransformersWebConnector } = await import('./SmartEmbedTransformersWebConnector.js');
    const model = new SmartEmbedTransformersWebConnector();
    model.model_name = model_name;
    model.window = window;
    await model.init();
    window.model = model;
  }
}