export interface Surah {
  number: number;
  name: string;
  arabicName: string;
}

export interface Country {
  name: string;
  code: string;
}

export interface Juzz {
  number: number;
}

export interface ReferenceItem {
  id: string;
  name: string;
  label: string;
  sortOrder: number;
}
