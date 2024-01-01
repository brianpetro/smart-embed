# Smart Embed
Conveniently embed content with a standardized interface that works with various local and remote embedding models.



```mermaid
graph TD
    SE[SmartEmbed] -->|is extended by| SETNA[SmartEmbedTransformersNodeAdapter]
    SE -->|is extended by| SETWA[SmartEmbedTransformersWebAdapter]
    SE -->|is extended by| SEAA[SmartEmbedApiAdapter]
    SEAA -->|is extended by| SEOAA[SmartEmbedOpenAIAdapter]
    SEOAA -->|is extended by| SEAdaApi[SmartEmbedAdaApi]
    SETWA -->|communicates via IPC| SETWC
    SETNA -->|is extended by| SEBgeSmallNode[SmartEmbedBgeSmallNode]
    SETNA -->|is extended by| SETWC[SmartEmbedTransformersWebConnector]
    SETWA -->|is extended by| SEBgeSmallWeb[SmartEmbedBgeSmallWeb]
```


## Development
- `node build_web.js` is used to compile the web connector for loading via the web adapter.