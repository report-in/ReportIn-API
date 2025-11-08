export type IReportForm = {
  campusId: string,
  facilityUserId: string,
  facilityUserName: string,
  facilityUserEmail: string,
  areaId: string,
  areaName: string,
  categoryId: string,
  categoryName: string,
  description: string
}

export type ISimilarReport = {
  campusId: string;
  areaId: string;
  categoryId: string;
}

export type IUpdateStatusReport = {
  status: string;
  technicianId: string;
  issue?: string;
  campusId: string;
  itemId?: string;
  difficulty?: number;
}

export type IExportExcelReport = {
  startDate: string;
  endDate: string;
  campusId: string;
}

export type IUpvoteReport = {
  reportId: string;
  personId: string;
}