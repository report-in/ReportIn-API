export type IReportForm = {
  campusId: string,
  complainantId: string,
  complainantName: string,
  complainantEmail: string,
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
  custodianId: string;
  issue?: string;
  campusId: string;
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