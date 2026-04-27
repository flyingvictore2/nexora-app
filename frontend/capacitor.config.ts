import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.nexora.streaming',
  appName: 'Nexora',
  webDir: 'out',
  server: {
    // Load the live website — no local build needed
    url: 'https://frontend-ashen-eta-86.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a0a0a',
  },
};

export default config;
