# Runtime Configuration Loading

This document explains how the application loads and instantiates configuration at runtime without environment files.

## Boot Sequence (Main Process / backend)

1.  **Application Start**: Electron `main.js` launches.
2.  **DB Connection**: `sqlite3` connects to the local database file `DB/lms.sqlite`.
3.  **Config Pre-load**:
    - A specific `ConfigService.init()` method is called.
    - Synchronously (or awaited async) fetches `SELECT * FROM system_settings`.
    - Populates a global singleton `AppConfig` object in memory.
4.  **Validation**: Checks for missing critical keys (e.g., ports). If missing, throws fatal error or enters "Recovery Mode".
5.  **Server Start**: Express server starts, using port defined in `AppConfig`.

## Runtime Updates

The configuration is cached in memory for performance, but needs to stay consistent.

- **Read Operations**: App reads from memory `AppConfig`.
- **Write Operations**:
    1.  Update Database `system_settings`.
    2.  Update Memory `AppConfig`.
    3.  (Optional) Emit event `config:updated` if other modules need to react immediately (e.g. valid re-connecting to Cloud).

## Electron <-> React Sync

Since the Frontend runs in a separate process (Renderer), it needs access to these configs.

- **Initial Load**:
    - Frontend makes an API call `GET /api/config` on startup.
    - backend returns public/safe configuration values.
    - Frontend stores them in a React Context (`ConfigContext`).

- **Updates**:
    - If needed, Semantic UI changes can trigger a re-fetch of config.
