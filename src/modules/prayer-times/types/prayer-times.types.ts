import { CalculationMode, ApiCalculationMethod, PrayerTimeSource } from '@prisma/client';

// Prayer time configuration for a user
export interface PrayerTimesConfigData {
  id: string;
  userId: string;
  calculationMode: CalculationMode;
  apiMethod: ApiCalculationMethod | null;
  manualFajr: string | null;
  manualZuhr: string | null;
  manualAsr: string | null;
  manualMaghrib: string | null;
  manualIsha: string | null;
  fajrAdjustment: number;
  zuhrAdjustment: number;
  asrAdjustment: number;
  maghribAdjustment: number;
  ishaAdjustment: number;
  lastFetchedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Daily prayer times
export interface DailyPrayerTimes {
  date: string; // YYYY-MM-DD format
  fajr: string; // HH:MM format
  zuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  source: PrayerTimeSource;
}

// Aladhan API response format
export interface AladhanTimingsResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string; // "HH:MM (ZONE)"
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
      Midnight: string;
      Firstthird: string;
      Lastthird: string;
    };
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
          ar: string;
        };
        month: {
          number: number;
          en: string;
          ar: string;
        };
        year: string;
        designation: {
          abbreviated: string;
          expanded: string;
        };
        holidays: string[];
      };
      gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: {
          en: string;
        };
        month: {
          number: number;
          en: string;
        };
        year: string;
        designation: {
          abbreviated: string;
          expanded: string;
        };
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
        params: {
          Fajr: number;
          Isha: number;
        };
        location: {
          latitude: number;
          longitude: number;
        };
      };
      latitudeAdjustmentMethod: string;
      midnightMode: string;
      school: string;
      offset: {
        Imsak: number;
        Fajr: number;
        Sunrise: number;
        Dhuhr: number;
        Asr: number;
        Maghrib: number;
        Sunset: number;
        Isha: number;
        Midnight: number;
      };
    };
  };
}

// Mapping of our API methods to Aladhan method IDs
export const ALADHAN_METHOD_MAP: Record<ApiCalculationMethod, number> = {
  MWL: 3, // Muslim World League
  ISNA: 2, // Islamic Society of North America
  EGYPT: 5, // Egyptian General Authority of Survey
  MAKKAH: 4, // Umm Al-Qura University, Makkah
  KARACHI: 1, // University of Islamic Sciences, Karachi
  TEHRAN: 7, // Institute of Geophysics, University of Tehran
};
