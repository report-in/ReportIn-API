export type IGetFacilityItemLogResponse = {
  id: string,
  itemId: string,
  issue: string,
  person: {
    personId: string,
    name: string,
    email: string,
  },
  isDeleted: boolean,
  createdBy: string,
  createdDate: string,
  lastUpdatedBy: string,
  lastUpdatedDate: string,
}