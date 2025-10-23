export type Preference = {
  personId: string,
  campusId: string,
  categoryId: string
};

export type IUpsertTechnicianPreference = {
  preferences: Preference[]
}