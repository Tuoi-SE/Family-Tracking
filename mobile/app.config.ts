import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'family-tracking-mobile',
  slug: 'family-tracking-mobile',
  version: '1.0.0',
  extra: {},
  ios: { supportsTablet: true },
  android: { adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#FFFFFF' } },
  web: { bundler: 'metro' }
});


