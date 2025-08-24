export type IGetAllAreaForm = {
  "campusId": string;
}

export type IAreaForm = {
  "campusId": string;
  "beaconId": string;
  "areaName": string;
  "createdBy": string;
}

export type IUpdateAreaForm = {
  "id": string;
  "campusId": string;
  "beaconId": string;
  "areaName": string;
}
