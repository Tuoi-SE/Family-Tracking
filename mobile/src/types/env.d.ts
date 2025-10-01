// Minimal ambient declaration so TypeScript accepts process.env in React Native
declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};


