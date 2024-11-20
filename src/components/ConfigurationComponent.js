import { useAlert, useDataEngine, useDataQuery } from '@dhis2/app-runtime';
import i18n from '@dhis2/d2-i18n';
import { Transfer } from '@dhis2/ui';
import React, { useContext, useEffect, useState } from 'react';
import { config } from '../consts.js';
import { SharedStateContext } from '../utils.js';
import { ConfiguredDataElements } from './ConfiguredDataElements.js';
import { ConfiguredStagesComponent } from './ConfiguredStagesComponent.js';
import { DataElementSortComponent } from './DataElementSortComponent.js';
import { Navigation } from './Navigation.js';
import ProgramComponent from './ProgramComponent.js';
import ProgramStageComponent from './ProgramStageComponent.js';

const ConfigurationComponent = () => {
    const {show} = useAlert(
        ({msg}) => msg,
        ({type}) => ({[type]: true})
    )

    const sharedState = useContext(SharedStateContext)

    const {
        selectedSharedProgram,
        setSelectedSharedProgram,
        selectedSharedOrgUnit,
    } = sharedState;

    const [keyExists, setKeyExists] = useState({});
    const [selectedProgram, setSelectedProgram] = useState(selectedSharedProgram);
    const [selectedStage, setSelectedStage] = useState('');
    const [attributes, setAttributes] = useState([]);
    const [nameAttributes, setNameAttributes] = useState([]);
    const [filterAttributes, setFilterAttributes] = useState([]);
    const [dataElements, setDataElements] = useState([]);
    const [configuredStages, setConfiguredStages] = useState({});
    const [selectedDataElements, setSelectedDataElements] = useState([]);
    const [selectedGroupDataElements, setSelectedGroupDataElements] = useState([]);
    const [selectedIndividualDataElements, setSelectedIndividualDataElements] = useState([]);
    const [endDateVisible, setEndDateVisible] = useState(false);
    const [groupEdit, setGroupEdit] = useState(false);
    const [editing, setEditing] = useState(false);
    const [configure, setConfigure] = useState(false);
    const [stages, setStages] = useState([]);
    const [columnDisplay, setColumnDisplay] = useState(false);
    const [configuredCondition, setSelectedConfiguredCondition] = useState([]);
    const [deleteAction, setDeleteAction] = useState(false)

    const engine = useDataEngine();

    const dataStoreQuery = {
        dataStore: {
            resource: `dataStore/${config.dataStoreName}?fields=.`,
        }
    };

    const query = {
        programs: {
            resource: `programs`,
            id: ({id}) => id,
            params: {
                fields: ['id', 'displayName', 'programTrackedEntityAttributes(trackedEntityAttribute(id, displayName))', 'trackedEntityType'],
                paging: 'false'
            },
        }
    }

    const dataElementsQuery = {
        programStage: {
            resource: `programStages`,
            id: ({id}) => id,
            params: ({
                fields: 'programStageDataElements(dataElement(id, name))'
            })
        }
    }

    const stageQuery = {
        programStages: {
            resource: 'programStages',
            params: ({program}) => ({
                fields: ['id', 'displayName'],
                filter: `program.id:eq:${program || '-'}`,
            })
        }
    }

    const {data} = useDataQuery(query, {
        variables: {
            id: selectedProgram
        }
    });

    const {data: stageData, refetch: refetchStages} = useDataQuery(stageQuery, {
        variables: {
            program: selectedProgram
        }
    });

    const {
        data: elementsData,
        refetch: refetchDataElements
    } = useDataQuery(dataElementsQuery, {variables: {id: selectedStage}});

    const {data: dataStore} = useDataQuery(dataStoreQuery);

    useEffect(() => {
        if ((data?.programs?.programs || data?.programs?.programTrackedEntityAttributes) && selectedProgram) {
            const attributes = (data.programs?.programs?.find(p => p.id === selectedProgram)?.programTrackedEntityAttributes ||
                data?.programs?.programTrackedEntityAttributes)?.map(attr => {
                return {
                    label: attr.trackedEntityAttribute.displayName,
                    value: attr.trackedEntityAttribute.id
                };
            });
            if (attributes) {
                setAttributes(attributes);
            }
        }
    }, [data, selectedProgram]);

    useEffect(() => {
        refetchDataElements({id: selectedStage});
        if (elementsData && elementsData.programStage && elementsData.programStage.programStageDataElements) {
            const dataElements = elementsData.programStage?.programStageDataElements?.map(data => data.dataElement);
            setDataElements(dataElements);
        }
    }, [elementsData, selectedStage]);

    useEffect(() => {
        refetchStages({program: selectedProgram})
        if (stageData && stageData.programStages) {
            setStages(stageData.programStages.programStages)
        }
    }, [selectedProgram, stageData]);

    useEffect(() => {
        if (dataStore?.dataStore?.entries) {
            let entry = dataStore.dataStore.entries.find(e => e.key === 'activeProgram');
            if (entry) {
                setSelectedProgram(entry.value);
                setSelectedSharedProgram(entry.value);
            }
            entry = dataStore.dataStore.entries.find(e => e.key === selectedProgram);
            if (entry) {
                setNameAttributes(entry.value.nameAttributes || []);
                setFilterAttributes(entry.value.filterAttributes || []);
                setConfiguredStages(entry.value.configuredStages || {
                    dataElements: [],
                    individualDataElements: [],
                    groupDataElements: [],
                })
                setEndDateVisible(entry.value.endDateVisible)
                setGroupEdit(entry.value.groupEdit);
                setColumnDisplay(entry.value.columnDisplay);
                setSelectedConfiguredCondition(entry.value.configuredCondition || []);
                const exists = keyExists;
                exists[selectedProgram] = true;
                setKeyExists(exists);
            }
        }
    }, [dataStore, selectedProgram]);

    useEffect(() => {
        if (configuredCondition) {
            if (configuredCondition.length > 0) {
                const filteredCondition = configuredCondition.filter(item => item.length !== 0);
                if (filteredCondition.length > 0) {
                    dataStoreOperation("configuredCondition", filteredCondition)
                }
            }
            if (configuredCondition.length === 0 && deleteAction) {
                setDeleteAction(false)
                dataStoreOperation("configuredCondition", configuredCondition)
                show({msg: `Condition Successfully Removed`, type: 'success'})
            }
        }

    }, [
        configuredCondition
    ])

    const handleProgramChange = (event) => {
        setSelectedProgram(event);
        setSelectedSharedProgram(event);
        setConfiguredStages({});
        setSelectedDataElements([]);
        setSelectedIndividualDataElements([]);
        setSelectedGroupDataElements([]);

        const mutation = {
            resource: `dataStore/${config.dataStoreName}/activeProgram`,
            type: 'create',
            data: event
        }
        engine.mutate(mutation).catch(e => {
            mutation.type = 'update';
            engine.mutate(mutation);
        })
    }

    const dataStoreOperation = (type, data) => {
        const value = {
            nameAttributes,
            filterAttributes,
            configuredStages,
            endDateVisible,
            groupEdit,
            columnDisplay,
            configuredCondition
        }
        value[type] = data;
        const mutation = {
            resource: `dataStore/${config.dataStoreName}/${selectedProgram}`,
            type: keyExists[selectedProgram] ? 'update' : 'create',
            data: value
        }
        engine.mutate(mutation).catch(_ => {
            mutation.type = 'update';
            engine.mutate(mutation);
        })
    }

    const moveElement = (array, from, to) => {
        // Remove the element from its original position
        const element = array.splice(from, 1)[0];

        // Insert it at the new position
        array.splice(to, 0, element);

        return array;
    }

    const moveDataElement = (type, from, to) => {
        let source = selectedDataElements;
        if (type === 'group') {
            source = selectedGroupDataElements;
        } else if (type === 'individual') {
            source = selectedIndividualDataElements;
        }
        const dataElements = moveElement(source, from, to);
        if (type === 'group') {
            setSelectedGroupDataElements([...dataElements]);
        } else if (type === 'individual') {
            setSelectedIndividualDataElements([...dataElements]);
        } else {
            setSelectedDataElements([...dataElements]);
        }

        const stages = configuredStages;
        stages[selectedStage] = {
            individualDataElements: type === 'individual' ? dataElements : selectedIndividualDataElements,
            dataElements: type === 'all' ? dataElements : selectedDataElements,
            groupDataElements: type === 'group' ? dataElements : selectedGroupDataElements
        };
        setConfiguredStages(stages);

        dataStoreOperation('configuredStages', stages);
    }

    return (
        <>
            <div className="flex flex-row w-full h-full">
                <div className="page">
                    <Navigation/>
                    <div className="p-6">
                        <div className="flex flex-col w-full">
                            <div className="card mb-2">
                                <div className="w-3/12">
                                    <ProgramComponent
                                        selectedProgram={selectedProgram}
                                        setSelectedProgram={handleProgramChange}
                                        disabled={!selectedSharedOrgUnit}
                                    />
                                </div>
                            </div>
                            <div className="card mb-2">
                                <label htmlFor="program"
                                       className="block label">
                                    {i18n.t('Participant Name Attribute(s)')}
                                </label>
                                <Transfer options={attributes} selected={nameAttributes}
                                          leftHeader={<div className="p-2 font-semibold">Available Attributes</div>}
                                          rightHeader={<div className="p-2 font-semibold">Configured
                                              Name Attribute(s)</div>}
                                          onChange={(payload) => {
                                              setNameAttributes(payload.selected);
                                              dataStoreOperation('nameAttributes', payload.selected);
                                          }}
                                          enableOrderChange
                                />
                            </div>

                            <div className="card mb-2">
                                <label className="block label">
                                    {i18n.t('Participant Filter Attribute(s)')}
                                </label>
                                <Transfer options={attributes} selected={filterAttributes}
                                          leftHeader={<div className="p-2 font-semibold">Available Attributes</div>}
                                          rightHeader={<div className="p-2 font-semibold">Configured
                                              Filter Attribute(s)</div>}
                                          onChange={(payload) => {
                                              setFilterAttributes(payload.selected);
                                              dataStoreOperation('filterAttributes', payload.selected);
                                          }}
                                          enableOrderChange
                                />
                            </div>
                            <div className="card mb-2">
                                <div
                                    className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={groupEdit === true}
                                        onChange={(payload) => {
                                            setGroupEdit(payload.target.checked);
                                            dataStoreOperation('groupEdit', payload.target.checked);
                                        }}
                                        className="checkbox"/>
                                    <label
                                        className="pt-2 pl-2 label">
                                        {i18n.t('Group Action?')} <span className="text-xs italic">Action will apply to all selected attendees</span>
                                    </label>
                                </div>
                            </div>
                            <div className="card mb-2">
                                <div
                                    className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={columnDisplay === true}
                                        onChange={(payload) => {
                                            setColumnDisplay(payload.target.checked);
                                            dataStoreOperation('columnDisplay', payload.target.checked);
                                        }}
                                        className="checkbox"/>
                                    <label
                                        className="pt-2 pl-2 label">
                                        {i18n.t('Display Data Elements as columns in table?')}
                                    </label>
                                </div>
                            </div>
                            <div className="shadow-sm rounded-md p-4 border border-blue-100 bg-white mb-2">
                                <label htmlFor="program"
                                       className="block mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                                    {i18n.t('Configure Data Elements')}
                                </label>
                                <div className="shadow-md rounded-md p-4 bg-white mb-4">
                                    <label htmlFor="program"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {i18n.t('Configured Stages')}
                                    </label>
                                    <div className="w-full flex flex-col">
                                        <div className="w-3/12 flex flex-col">
                                            {!configure &&
                                                <div>
                                                    <ProgramStageComponent
                                                        selectedProgram={selectedProgram}
                                                        selectedStage={selectedStage}
                                                        filteredStages={Object.keys(configuredStages).filter(s => {
                                                            const stage = configuredStages[s];
                                                            return ((stage['dataElements']) || []).length > 0;
                                                        })}
                                                        setSelectedStage={(selection) => {
                                                            setSelectedStage(selection);
                                                            if (selection) {
                                                                setEditing(true);
                                                                setConfigure(false);
                                                                setSelectedDataElements([]);
                                                                setSelectedGroupDataElements([]);
                                                                setSelectedIndividualDataElements([])

                                                                const stages = configuredStages;
                                                                const stage = stages[selection];
                                                                stages[selection] = {
                                                                    individualDataElements: stage ? stage['individualDataElements'] || [] : [],
                                                                    dataElements: stage ? stage['dataElements'] || [] : [],
                                                                    groupDataElements: stage ? stage['groupDataElements'] || [] : []
                                                                };
                                                                setConfiguredStages(stages);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            }
                                        </div>
                                        {(!configure && !editing) &&
                                            <ConfiguredStagesComponent stages={stages}
                                                                       configuredStages={configuredStages}
                                                                       onSort={(stage) => {
                                                                           setConfigure(true);
                                                                           setEditing(false);
                                                                           setSelectedDataElements(configuredStages[stage]['dataElements'] || []);
                                                                           setSelectedStage(stage)
                                                                       }}
                                                                       onEdit={(stage) => {
                                                                           setEditing(true);
                                                                           setConfigure(false);
                                                                           setSelectedDataElements(configuredStages[stage]['dataElements'] || []);
                                                                           setSelectedStage(stage)
                                                                       }}/>
                                        }
                                    </div>
                                </div>
                                {editing &&
                                    <div className="w-full flex flex-col pt-2">
                                        <ConfiguredDataElements
                                            dataElements={dataElements}
                                            configuredStages={configuredStages}
                                            caption={'Select data Elements the will be visible for the selected stage when attending to participants'}
                                            selectedStage={selectedStage}
                                            checkDataElements={selectedDataElements}
                                            configuredCondition={configuredCondition}
                                            setSelectedConfiguredCondition={setSelectedConfiguredCondition}
                                            onSelectAll={(checked) => {
                                                if (checked) {
                                                    setSelectedDataElements(dataElements.map(de => de.id))
                                                } else {
                                                    setSelectedDataElements([]);
                                                }
                                            }}
                                            onSelect={(de) => {
                                                if (selectedDataElements?.includes(de)) {
                                                    setSelectedDataElements(selectedDataElements?.filter(rowId => rowId !== de));
                                                } else {
                                                    setSelectedDataElements([...selectedDataElements, de]);
                                                }
                                            }}
                                            onDelete={() => {
                                                const stages = configuredStages
                                                delete stages[selectedStage]['dataElements'];
                                                if (!stages[selectedStage]['individualDataElements'] &&
                                                    !stages[selectedStage]['dataElements'] &&
                                                    !stages[selectedStage]['groupDataElement']) {
                                                    delete stages[selectedStage]
                                                }
                                                setConfiguredStages(stages);
                                                setEditing(false);
                                                setSelectedStage('');

                                                dataStoreOperation('configuredStages', stages);
                                            }}
                                            onSave={() => {
                                                const updatedStages = {
                                                    ...configuredStages,
                                                    [selectedStage]: {
                                                        ...configuredStages[selectedStage],  // Retain existing properties
                                                        individualDataElements: configuredStages[selectedStage]?.individualDataElements || [],
                                                        dataElements: selectedDataElements
                                                    }
                                                };
                                                dataStoreOperation('configuredStages', updatedStages);

                                                // Reset states after saving
                                                setEditing(false);
                                                setConfigure(true);
                                            }}
                                            onCancel={() => {
                                                setEditing(false);
                                                setConfigure(false);
                                            }}
                                            stages={stages}
                                        />
                                    </div>
                                }
                                {configure &&
                                    <div className="w-full flex flex-col pt-2">
                                        <DataElementSortComponent
                                            dataElements={dataElements}
                                            checkDataElements={selectedDataElements}
                                            moveDataElement={(from, to) => moveDataElement('all', from, to)}
                                            onClose={() => {
                                                const stages = configuredStages
                                                stages[selectedStage] = {
                                                    dataElements: selectedDataElements,
                                                    individualDataElements: selectedIndividualDataElements,
                                                    groupDataElements: selectedGroupDataElements
                                                };
                                                setConfiguredStages(stages);
                                                setSelectedStage('');
                                                setConfigure(false);
                                                setEditing(false)

                                            }}
                                            selectedStage={selectedStage}
                                            stages={stages}
                                        />
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConfigurationComponent;
