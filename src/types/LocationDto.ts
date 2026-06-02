import { ILocation } from "../models/Location";

export type LocationDto = ILocation & {
  parentName: string | null;
};
