export type PickupStationStatus = "active" | "disabled";

export type PickupStation = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  hours: string;
  status: PickupStationStatus;
};

export const SEED_PICKUP_STATIONS: PickupStation[] = [
  {
    id: "PKS001",
    name: "Diamond Body — Lekki Phase 1",
    address: "Brasisas Mall, off Admiralty way Lekki Phase 1",
    city: "Lekki",
    state: "Lagos",
    hours: "Mon–Sat, 9am–6pm",
    status: "active",
  },
  {
    id: "PKS003",
    name: "Diamond Body — Abuja Central",
    address: "306b, Bahamas Plaza, 1080 Joseph Gwomwalk Street",
    city: "Abuja",
    state: "FCT",
    hours: "Mon–Sat, 9am–6pm",
    status: "active",
  },
];

export const DELIVERY_FEE = 5000;