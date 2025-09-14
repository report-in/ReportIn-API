import { ICustomization } from "../../models/customization.model";
import { ICustomizationForm } from "./customization.request";

export type ICampusForm = {
  userId: string,
  name: string,
  mandatoryEmail: string[],
  siteName: string,
  provider: string,
  customization:{
    primaryColor: string,
    logo: string
  }
};

export type IUpdateCampusForm = {
  userId: string,
  name: string,
  mandatoryEmail: string[],
  siteName: string,
  provider: string,
  customization: {
    customizationId: string,
    primaryColor: string
  }
}