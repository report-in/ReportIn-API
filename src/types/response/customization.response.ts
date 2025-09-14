export type IGetCustomizationResponse = {
  customizationId: string,
  primaryColor: string,
  logo: string
}

export type IGetCustomizationDetailResponse = {
  id: string,
  campusId: string,
  primaryColor: string,
  logo: string,
  isDeleted: boolean,
  createdBy: string,
  createdDate: string,
  lastUpdatedBy: string,
  lastUpdatedDate: string,
}