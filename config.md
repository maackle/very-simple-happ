```yaml
---
environment_path: ,,,
keystore:
  type: lair_server_legacy_deprecated
  keystore_path: ~
  danger_passphrase_insecure_from_config: default-insecure-passphrase
dpki: ~
admin_interfaces:
  - driver:
      type: websocket
      port: 3333
network:
  network_type: quic_bootstrap
  transport_pool:
    - type: proxy
      sub_transport:
        type: quic
        bind_to: ~
        override_host: ~
        override_port: ~
      proxy_config:
        type: remote_proxy_client_from_bootstrap
        bootstrap_url: "https://bootstrap.holo.host/"
        fallback_proxy_url: "kitsune-proxy://SYVd4CF3BdJ4DS7KwLLgeU3_DbHoZ34Y-qroZ79DOs8/kitsune-quic/h/165.22.32.11/p/5779/--"
  bootstrap_service: "https://bootstrap.holo.host/"

db_sync_strategy: Fast
```
