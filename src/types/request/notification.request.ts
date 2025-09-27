export type ICreateNotificationForm = {
  "campusId": string;
  "personId": string;
  "token": string;
}

export type ISendNotificationForm = {
  campusId: string,
  message: string,
  image: string
}