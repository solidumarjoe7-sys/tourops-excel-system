export interface ArrivalRecord {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  pax: number;
  avail: string; // Availability (e.g., RT Transfer, Tour A)
  number: string; // Contact Number
  hotel: string;
  eta: string; // Estimated Time of Arrival
  collect: string; // Payment/Collect amount
}

export interface DepartureRecord {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  pax: number;
  avail: string; // Availability (e.g., RT Transfer)
  number: string; // Contact Number
  hotel: string;
  etd: string; // Estimated Time of Departure
  pickupTime: string; // Pickup Time
}

export interface AttendanceDayLog {
  timeIn: string; // e.g., "08:00"
  timeOut: string; // e.g., "17:00"
  location: string; // e.g., "Airport", "Hotel Lobby", "Port"
  status?: string; // "DUTY" | "DAY OFF" | "HALF DAY"
}

export interface EmployeeAttendance {
  id: string;
  name: string;
  // Map of YYYY-MM-DD date strings to daily log info
  logs: {
    [date: string]: AttendanceDayLog;
  };
}

export type Language = 'en' | 'tl';

