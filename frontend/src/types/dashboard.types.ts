export interface DashboardTotal {
  total: number;
}

export interface FishFarmLocation {
  fishFarmId: string;
  fishFarmName: string;
  latitude: number;
  longitude: number;
}

export interface DashboardData {
  totalFishFarms: number;
  totalEmployees: number;
  locations: FishFarmLocation[];
}