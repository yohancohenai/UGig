export interface College {
  id: string;
  name: string;
  shortName: string;
  location: string;
  accent: string;
}

/**
 * Central college registry.
 * To add a new college, just append an entry to this array.
 */
export const COLLEGES: College[] = [
  { id: 'uf',    name: 'University of Florida',            shortName: 'UF',   location: 'Gainesville, FL',  accent: '#FA4616' },
  { id: 'fsu',   name: 'Florida State University',         shortName: 'FSU',  location: 'Tallahassee, FL',  accent: '#782F40' },
  { id: 'ucf',   name: 'University of Central Florida',    shortName: 'UCF',  location: 'Orlando, FL',      accent: '#BA8B02' },
  { id: 'fiu',   name: 'Florida International University', shortName: 'FIU',  location: 'Miami, FL',        accent: '#081E3F' },
  { id: 'usf',   name: 'University of South Florida',      shortName: 'USF',  location: 'Tampa, FL',        accent: '#006747' },
  { id: 'fau',   name: 'Florida Atlantic University',      shortName: 'FAU',  location: 'Boca Raton, FL',   accent: '#003366' },
  { id: 'famu',  name: 'Florida A&M University',           shortName: 'FAMU', location: 'Tallahassee, FL',  accent: '#FF6600' },
  { id: 'um',    name: 'University of Miami',              shortName: 'UM',   location: 'Coral Gables, FL', accent: '#F47321' },
];

export function getCollegeById(id: string): College | undefined {
  return COLLEGES.find(c => c.id === id);
}
