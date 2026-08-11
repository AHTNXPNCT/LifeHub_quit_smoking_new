interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

// The application itself is a static Vite PWA. Cloudflare serves its files
// directly; this Worker only passes through any request that reaches it.
export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
