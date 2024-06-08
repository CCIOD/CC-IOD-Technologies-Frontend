export interface DataRowCarriers {
  id: number;
  name: string;
  residence_area: string;
  placement_date: string;
  placement_time: string;
  electronic_bracelet: string;
  beacon: string;
  wireless_charger: string;
  information_emails: string;
  contact_numbers: string;
  house_arrest: string;
  installer_name: string;
  observations: string;
  relationship_name: string;
  relationship_id: number;
}

export interface ICarrierForm {
  residence_area: string;
  placement_date: string;
  placement_time: string;
  electronic_bracelet: string;
  beacon: string;
  wireless_charger: string;
  information_emails: string[];
  contact_numbers: string[];
  house_arrest: string;
  installer_name: string;
  observations?: string;
  client_id: number;
  relationship_id: number;
}
