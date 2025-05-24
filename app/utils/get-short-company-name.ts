import type { Company } from '~~/types';

export function getCompanyCode (company: Company): string {
  if (!company.name) return ''

  if (company.name?.split(' ')?.length > 2 && company.code) return company.code
  else return company.name
}