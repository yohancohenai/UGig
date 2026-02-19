export interface College {
  id: string;
  name: string;
  shortName: string;
  location: string;
}

/**
 * Central college registry.
 * To add a new college, just append an entry to this array.
 */
export const COLLEGES: College[] = [
  { id: 'uf',    name: 'University of Florida',          shortName: 'UF',    location: 'Gainesville, FL' },
  { id: 'fsu',   name: 'Florida State University',       shortName: 'FSU',   location: 'Tallahassee, FL' },
  { id: 'ucf',   name: 'University of Central Florida',  shortName: 'UCF',   location: 'Orlando, FL' },
  { id: 'fiu',   name: 'Florida International University', shortName: 'FIU', location: 'Miami, FL' },
  { id: 'usf',   name: 'University of South Florida',    shortName: 'USF',   location: 'Tampa, FL' },
  { id: 'fau',   name: 'Florida Atlantic University',    shortName: 'FAU',   location: 'Boca Raton, FL' },
  { id: 'famu',  name: 'Florida A&M University',         shortName: 'FAMU',  location: 'Tallahassee, FL' },
  { id: 'um',    name: 'University of Miami',            shortName: 'UM',    location: 'Coral Gables, FL' },
];

export function getCollegeById(id: string): College | undefined {
  return COLLEGES.find(c => c.id === id);
}
