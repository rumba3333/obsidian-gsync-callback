# Obsidian GSync - owner-controlled OAuth callback

Private-use OAuth redirect website. This public repository does not contain vault files, notes, OAuth client secrets, access tokens, or refresh tokens.

The only website content is docs/callback.html: a static copy of upstream ObsidianGSync v1.1.0 (https://github.com/dg0988/ObsidianGSync/tree/1.1.0/docs/callback.html) for use as a callback on an account-controlled GitHub Pages URL. It hands the one-time OAuth code directly back to the local obsidian://gsync-auth protocol handler, without API calls, third-party requests, storage, trackers or remote scripts. It removes query parameters from browser history.

For the plugin's license attribution see LICENSE (MIT, copyright dg0988).

Security: Do not commit app credentials, secrets or Obsidian vault data to this repository. Restrict Google OAuth client authorizations to the owner's Google account. Keep plugin settings and credentials only on the owner's devices.
