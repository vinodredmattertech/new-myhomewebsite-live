module.exports = {
  apps: [
    {
      name: 'frontend-myhomegroup',
      // Run Next directly rather than through `npm run start`: with npm in
      // between, pm2 watches npm's memory instead of the server's, so
      // max_memory_restart could never fire.
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      // Restart cleanly before the kernel's OOM killer does it for us
      // (exit 137 / "Killed" in the error log).
      node_args: '--max-old-space-size=1024',
      max_memory_restart: '1200M',
      env: {
        NODE_ENV: 'production',
        // Nearly all of this process's memory is native, not JS heap: sharp's
        // threads each get their own glibc malloc arena and never hand the
        // memory back. Two arenas cut peak RSS from ~700MB to ~300MB under
        // the same image load. https://sharp.pixelplumbing.com/install#linux-memory-allocator
        MALLOC_ARENA_MAX: '2',
      },
    },
  ],
};
