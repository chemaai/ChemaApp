import appJson from './app.json';

export default {
  ...appJson.expo,
  ios: {
    ...appJson.expo.ios,
    infoPlist: {
      ...(appJson.expo.ios?.infoPlist || {}),
      NSCameraUsageDescription:
        'Chema only uses your camera when you choose to scan or capture content for analysis.',
    },
  },
  extra: {
    ...appJson.expo.extra,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};

