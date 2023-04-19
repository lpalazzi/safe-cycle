declare var umami: umami.umami;

// Based on https://umami.is/docs/tracker-functions
declare module umami {
  interface umami {
    track(
      event_name?: string,
      event_data?: {
        data: any;
        hostname?: string;
        language?: string;
        referrer?: string;
        screen?: string;
        title?: string;
        url?: string;
        website?: string;
      }
    ): void;
  }
}
