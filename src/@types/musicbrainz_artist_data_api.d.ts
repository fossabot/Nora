/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
// https://musicbrainz.org/ws/2/artist/f225e9cb-022f-4fe2-988d-dd24e2440ebb?inc=url-rels+release-groups&fmt=json
// Artist info about ILLIRA

// Generated by https://quicktype.io

export interface MusicBrainzArtistDataAPI {
  name: string;
  country: string;
  'gender-id': string;
  'begin-area': Area;
  type: string;
  end_area: null;
  'release-groups': ReleaseGroup[];
  area: Area;
  relations: Relation[];
  'type-id': string;
  'end-area': null;
  ipis: any[];
  disambiguation: string;
  'life-span': LifeSpan;
  isnis: any[];
  'sort-name': string;
  begin_area: Area;
  gender: string;
  id: string;
}

export interface Area {
  id: string;
  'iso-3166-1-codes'?: string[];
  type: null;
  'type-id': null;
  name: string;
  disambiguation: string;
  'sort-name': string;
}

export interface LifeSpan {
  begin: string;
  end: null;
  ended: boolean;
}

export interface Relation {
  'target-type': TargetType;
  end: null;
  direction: Direction;
  type: string;
  'target-credit': string;
  url: URL;
  attributes: any[];
  'source-credit': SourceCredit;
  'attribute-values': Attribute;
  begin: null | string;
  ended: boolean;
  'attribute-ids': Attribute;
  'type-id': string;
}

export interface Attribute {}

export enum Direction {
  Forward = 'forward',
}

export enum SourceCredit {
  Empty = '',
  IliraGashi = 'Ilira Gashi',
}

export enum TargetType {
  URL = 'url',
}

export interface URL {
  id: string;
  resource: string;
}

export interface ReleaseGroup {
  'secondary-types': any[];
  'secondary-type-ids': any[];
  'primary-type': PrimaryType;
  id: string;
  title: string;
  'first-release-date': string;
  disambiguation: string;
  'primary-type-id': string;
}

export enum PrimaryType {
  Single = 'Single',
}