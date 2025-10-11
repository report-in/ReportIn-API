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

export type IVerificationCampusForm = {
    userId: string,
    campusId:string,
    status: string,
    comment: string
}

export type ISubdomainCampusForm = {
    subdomain: string
}