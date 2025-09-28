import { IGetCustomizationResponse } from "./customization.response"

export type IGetCampusResponse = {
  id: string,
  name: string,
  siteName: string,
  logo: string,
  status: string
}

export type IGetCampusDetailResponse = {
  id: string,
  userId: string,
  name: string,
  mandatoryEmail: string[],
  siteName: string,
  document: string[],
  status: string,
  comment: string,
  provider: string,
  customization: IGetCustomizationResponse
  isDeleted: boolean,
  createdBy: string,
  createdDate: string,
  lastUpdatedBy: string,
  lastUpdatedDate: string,
}

export type IGetSubdomainCampusResponse = {
  campusId: string,
  name: string,
  mandatoryEmail: string[],
  siteName: string, 
  provider: string,
  customization: IGetCustomizationResponse
}