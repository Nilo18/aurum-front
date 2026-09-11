import { Row } from '../shared/staff-row';

export const vehiclesSeed: Row[] = [
  {
    id: 1,
    type: 'PASSENGER_VEHICLE',
    passengerCapacity: 16,
    cargoWeightLimit: 250,
  },
  {
    id: 2,
    type: 'TRUCK',
    passengerCapacity: 2,
    cargoWeightLimit: 3500,
  },
  {
    id: 3,
    type: 'PASSENGER_VEHICLE',
    passengerCapacity: 7,
    cargoWeightLimit: 150,
  },
];
