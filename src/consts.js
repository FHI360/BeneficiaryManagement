export const config = {
    dataStoreName: 'impact-project-definition',
    dataStoreSearchHistory: 'sherlock-search-history'
}

export const ProjectsFiltersMore = 'fields=key,projectName,programid,attributesSelected,selectedOU,fullOrgUnitSearch';
export const SearchHistory = 'fields=key,programid,projectName,attributesSelected,fullOrgUnitSearch,modifiedDate,selectedOU,ProgramName'
export const dataStoreQueryMore = {
    dataStore: {
        resource: `dataStore/${config.dataStoreName}?${ProjectsFiltersMore}&paging=false`,
    },
}
export const dataStoreSearchHistoryQueryMore = {
    dataStore: {
        resource: `dataStore/${config.dataStoreSearchHistory}?${SearchHistory}&paging=false`,
    },
}


export const MainTitle = 'Impact Connect'
export const ProjectAttributedescription = 'Project Attribute'
export const searchBoundarySelected = 'Search Selected Organization Unit Tree'
export const searchBoundaryfull = 'Search Full Organization Unit Tree'
const version = 'Version v1.0.0 | Beta 20-08-2024'
export const footerText = `Copyright © FHI360 | EpiC | Business Solutions | 2024 | ${version}`
export const project_description = 'This application resolves duplicate issues'
export const panelAction = 'Finding duplicate tracked entities'

export const REFERENCIAS = 'ItVYsNfJZEX';
export const ACTUALIZACAO = 'xZVwawMNs1d';
export const REFERENCIAS_OPTIONS = [
    {
        label: 'ATS',
        active: true,
        dataElements: {
            feitas: {
                check: 'Gi0kAeopvwI',
                date: 'lcK3hG27aqa'
            },
            contras: {
                check: 'S5S3Y3m2n1u',
                date: 'aUdKf0D9kR4'
            }
        }
    },
    {
        label: 'TARV',
        active: true,
        dataElements: {
            feitas: {
                check: 'np2pRND86tU',
                date: 'Ewggeu8deSn'
            },
            contras: {
                check: 'iRu7MRXWywX',
                date: 'JZ0ReYG4cpj'
            }
        }
    },
    {
        label: 'SSR',
        active: true,
        dataElements: {
            feitas: {
                check: 'MsXjGfuvJyi',
                date: 'ainqQ4FeqNA'
            },
            contras: {
                check: 'WDKSBiSVliQ',
                date: 'uCsIdnvhuJ6'
            }
        }
    },
    {
        label: 'VBG',
        active: true,
        dataElements: {
            feitas: {
                check: 'HdZCC8IxQXS',
                date: 'KNOMe1XMd1i'
            },
            contras: {
                check: 'sGRZG35jn0X',
                date: 'aQjrRZWLkVB'
            }
        }
    },
    {
        label: 'SAAJ',
        active: true,
        dataElements: {
            feitas: {
                check: 'ElUg2D1D1BG',
                date: 'V8Xzn2y22kF'
            },
            contras: {
                check: 't7NGs6koIon',
                date: 'U9nx5HqyBQP'
            }
        }
    },
    {
        label: 'CMMV',
        active: true,
        dataElements: {
            feitas: {
                check: 'YBPGKeJx4P4',
                date: 'YaXI1CRAknK'
            },
            contras: {
                check: 'T7Jfolz7aUj',
                date: 'a8zfqxNpFHq'
            }
        }
    },
    {
        label: 'OUTRAS',
        active: true,
        dataElements: {
            feitas: {
                check: 'LaICjazxers',
                date: 'rFlw69Kk42c'
            },
            contras: {
                check: 'u1WwW2ajjkz',
                date: 'p336WqIoBuN'
            }
        }
    }
]
