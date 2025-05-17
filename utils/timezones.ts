// utils/timezones.ts
export interface TimeZone {
  zone: string;
  name: string;
  offset: string;
  label: string;
  region: string;
}

export const timeZones: TimeZone[] = [
  // Universal
  {
    zone: "UTC",
    name: "Coordinated Universal Time",
    offset: "UTC+0",
    label: "UTC (GMT+0)",
    region: "Universal",
  },

  // Americas
  {
    zone: "America/New_York",
    name: "Eastern Time",
    offset: "UTC-5",
    label: "New York (ET, UTC-5)",
    region: "Americas",
  },
  {
    zone: "America/Chicago",
    name: "Central Time",
    offset: "UTC-6",
    label: "Chicago (CT, UTC-6)",
    region: "Americas",
  },
  {
    zone: "America/Denver",
    name: "Mountain Time",
    offset: "UTC-7",
    label: "Denver (MT, UTC-7)",
    region: "Americas",
  },
  {
    zone: "America/Los_Angeles",
    name: "Pacific Time",
    offset: "UTC-8",
    label: "Los Angeles (PT, UTC-8)",
    region: "Americas",
  },
  {
    zone: "America/Anchorage",
    name: "Alaska Time",
    offset: "UTC-9",
    label: "Anchorage (AT, UTC-9)",
    region: "Americas",
  },
  {
    zone: "America/Halifax",
    name: "Atlantic Time",
    offset: "UTC-4",
    label: "Halifax (AT, UTC-4)",
    region: "Americas",
  },
  {
    zone: "America/St_Johns",
    name: "Newfoundland Time",
    offset: "UTC-3:30",
    label: "St. John's (NT, UTC-3:30)",
    region: "Americas",
  },
  {
    zone: "America/Sao_Paulo",
    name: "Brasilia Time",
    offset: "UTC-3",
    label: "Sao Paulo (BRT, UTC-3)",
    region: "Americas",
  },
  {
    zone: "America/Argentina/Buenos_Aires",
    name: "Argentina Time",
    offset: "UTC-3",
    label: "Buenos Aires (ART, UTC-3)",
    region: "Americas",
  },

  // Europe
  {
    zone: "Europe/London",
    name: "British Time",
    offset: "UTC+0",
    label: "London (GMT, UTC+0)",
    region: "Europe",
  },
  {
    zone: "Europe/Paris",
    name: "Central European Time",
    offset: "UTC+1",
    label: "Paris (CET, UTC+1)",
    region: "Europe",
  },
  {
    zone: "Europe/Berlin",
    name: "Central European Time",
    offset: "UTC+1",
    label: "Berlin (CET, UTC+1)",
    region: "Europe",
  },
  {
    zone: "Europe/Moscow",
    name: "Moscow Time",
    offset: "UTC+3",
    label: "Moscow (MSK, UTC+3)",
    region: "Europe",
  },
  {
    zone: "Europe/Istanbul",
    name: "Turkey Time",
    offset: "UTC+3",
    label: "Istanbul (TRT, UTC+3)",
    region: "Europe",
  },

  // Africa
  {
    zone: "Africa/Cairo",
    name: "Eastern European Time",
    offset: "UTC+2",
    label: "Cairo (EET, UTC+2)",
    region: "Africa",
  },
  {
    zone: "Africa/Algiers",
    name: "Central European Time",
    offset: "UTC+1",
    label: "Algiers (CET, UTC+1)",
    region: "Africa",
  },
  {
    zone: "Africa/Tunis",
    name: "Central European Time",
    offset: "UTC+1",
    label: "Tunis (CET, UTC+1)",
    region: "Africa",
  },
  {
    zone: "Africa/Casablanca",
    name: "Western European Time",
    offset: "UTC+0",
    label: "Casablanca (WET, UTC+0)",
    region: "Africa",
  },
  {
    zone: "Africa/Tripoli",
    name: "Eastern European Time",
    offset: "UTC+2",
    label: "Tripoli (EET, UTC+2)",
    region: "Africa",
  },
  {
    zone: "Africa/Khartoum",
    name: "Central Africa Time",
    offset: "UTC+2",
    label: "Khartoum (CAT, UTC+2)",
    region: "Africa",
  },
  {
    zone: "Africa/Lagos",
    name: "West Africa Time",
    offset: "UTC+1",
    label: "Lagos (WAT, UTC+1)",
    region: "Africa",
  },
  {
    zone: "Africa/Johannesburg",
    name: "South Africa Standard Time",
    offset: "UTC+2",
    label: "Johannesburg (SAST, UTC+2)",
    region: "Africa",
  },

  // Asia
  {
    zone: "Asia/Dubai",
    name: "Gulf Time",
    offset: "UTC+4",
    label: "Dubai (GST, UTC+4)",
    region: "Asia",
  },
  {
    zone: "Asia/Riyadh",
    name: "Arabian Time",
    offset: "UTC+3",
    label: "Riyadh (AST, UTC+3)",
    region: "Asia",
  },
  {
    zone: "Asia/Tehran",
    name: "Iran Standard Time",
    offset: "UTC+3:30",
    label: "Tehran (IRST, UTC+3:30)",
    region: "Asia",
  },

  {
    zone: "Asia/Baghdad",
    name: "Arabian Time",
    offset: "UTC+3",
    label: "Baghdad (AST, UTC+3)",
    region: "Asia",
  },
  {
    zone: "Asia/Kuwait",
    name: "Arabian Time",
    offset: "UTC+3",
    label: "Kuwait (AST, UTC+3)",
    region: "Asia",
  },
  {
    zone: "Asia/Qatar",
    name: "Arabian Time",
    offset: "UTC+3",
    label: "Doha (AST, UTC+3)",
    region: "Asia",
  },
  {
    zone: "Asia/Beirut",
    name: "Eastern European Time",
    offset: "UTC+2",
    label: "Beirut (EET, UTC+2)",
    region: "Asia",
  },
  {
    zone: "Asia/Damascus",
    name: "Eastern European Time",
    offset: "UTC+2",
    label: "Damascus (EET, UTC+2)",
    region: "Asia",
  },
  {
    zone: "Asia/Kolkata",
    name: "India Standard Time",
    offset: "UTC+5:30",
    label: "Kolkata (IST, UTC+5:30)",
    region: "Asia",
  },
  {
    zone: "Asia/Karachi",
    name: "Pakistan Standard Time",
    offset: "UTC+5",
    label: "Karachi (PKT, UTC+5)",
    region: "Asia",
  },
  {
    zone: "Asia/Shanghai",
    name: "China Standard Time",
    offset: "UTC+8",
    label: "Shanghai (CST, UTC+8)",
    region: "Asia",
  },
  {
    zone: "Asia/Tokyo",
    name: "Japan Standard Time",
    offset: "UTC+9",
    label: "Tokyo (JST, UTC+9)",
    region: "Asia",
  },
  {
    zone: "Asia/Seoul",
    name: "Korea Standard Time",
    offset: "UTC+9",
    label: "Seoul (KST, UTC+9)",
    region: "Asia",
  },
  {
    zone: "Asia/Jakarta",
    name: "Western Indonesia Time",
    offset: "UTC+7",
    label: "Jakarta (WIB, UTC+7)",
    region: "Asia",
  },

  // Australia
  {
    zone: "Australia/Sydney",
    name: "Australian Eastern Time",
    offset: "UTC+10",
    label: "Sydney (AET, UTC+10)",
    region: "Australia",
  },
  {
    zone: "Australia/Adelaide",
    name: "Australian Central Time",
    offset: "UTC+9:30",
    label: "Adelaide (ACST, UTC+9:30)",
    region: "Australia",
  },
  {
    zone: "Australia/Perth",
    name: "Australian Western Time",
    offset: "UTC+8",
    label: "Perth (AWT, UTC+8)",
    region: "Australia",
  },

  // Pacific
  {
    zone: "Pacific/Auckland",
    name: "New Zealand Standard Time",
    offset: "UTC+12",
    label: "Auckland (NZST, UTC+12)",
    region: "Pacific",
  },
  {
    zone: "Pacific/Honolulu",
    name: "Hawaii-Aleutian Time",
    offset: "UTC-10",
    label: "Honolulu (HAST, UTC-10)",
    region: "Pacific",
  },
  {
    zone: "Pacific/Fiji",
    name: "Fiji Time",
    offset: "UTC+12",
    label: "Fiji (FJT, UTC+12)",
    region: "Pacific",
  },

  // Additional regions
  {
    zone: "Indian/Maldives",
    name: "Maldives Time",
    offset: "UTC+5",
    label: "Maldives (MVT, UTC+5)",
    region: "Indian Ocean",
  },
  {
    zone: "Indian/Mauritius",
    name: "Mauritius Time",
    offset: "UTC+4",
    label: "Mauritius (MUT, UTC+4)",
    region: "Indian Ocean",
  },
];
