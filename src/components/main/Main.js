import { useAlert, useDataEngine, useDataQuery } from '@dhis2/app-runtime';
import i18n from '@dhis2/d2-i18n';
import { CalendarInput, Modal, ModalActions, ModalContent, ModalTitle, Pagination } from '@dhis2/ui';
import classnames from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { ACTUALIZACAO, ACTUALIZACAO_OPTIONS, config, REFERENCIAS, REFERENCIAS_OPTIONS } from '../../consts.js';
import {
    formatDate,
    getParticipant,
    isObjectEmpty,
    searchEntities,
    SharedStateContext,
    sortEntities
} from '../../utils.js';
import { ActualizacaoComponent } from '../ActualizacaoComponent.js';
import { DataElementComponent } from '../DataElement.js';
import { Navigation } from '../Navigation.js';
import OrganisationUnitComponent from '../OrganisationUnitComponent.js';
import ProgramComponent from '../ProgramComponent.js';
import ProgramStageComponent from '../ProgramStageComponent.js';
import { ReferenciasComponent } from '../ReferenciasComponent.js';
import { SearchComponent } from '../SearchComponent.js';
import { SpinnerComponent } from '../SpinnerComponent.js';

export const Main = () => {
    const engine = useDataEngine();
    const sharedState = useContext(SharedStateContext)

    const {
        selectedSharedOU,
        setSelectedSharedOU,
        selectedSharedProgram,
        setSelectedSharedProgram,
        selectedSharedOrgUnit,
        setSelectedSharedOrgUnit,
        selectedSharedStage,
        setSelectedSharedStage
    } = sharedState;

    const [selectedProgram, setSelectedProgram] = useState(selectedSharedProgram);
    const [selectedStage, setSelectedStage] = useState(selectedSharedStage);
    const [dataElements, setDataElements] = useState([]);
    const [orgUnit, setOrgUnit] = useState(selectedSharedOrgUnit);
    const [dates, setDates] = useState([new Date()]);
    const [startDate, setStateDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [entities, setEntities] = useState([]);
    const [allEntities, setAllEntities] = useState([]);
    const [filterValue, setFilterValue] = useState({});
    const [selectedOU, setSelectedOU] = useState(selectedSharedOU);
    const [nameAttributes, setNameAttributes] = useState([]);
    const [filterAttributes, setFilterAttributes] = useState([]);
    const [configuredStages, setConfiguredStages] = useState({});
    const [entityAttributes, setEntityAttributes] = useState([]);
    const [endDateVisible, setEndDateVisible] = useState(false);
    const [groupEdit, setGroupEdit] = useState(false);
    const [edits, setEdits] = useState([]);
    const [originalEdits, setOriginalEdits] = useState([]);
    const [selectedEntities, setSelectedEntities] = useState([]);
    const [repeatable, setRepeatable] = useState(false);
    const [columnDisplay, setColumnDisplay] = useState(false);
    const [groupValues, setGroupValues] = useState({});
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [modalShow, setModalShow] = useState(false);
    const [confirmShow, setConfirmShow] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toggle, setToggle] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const [configuredCondition, setSelectedConfiguredCondition] = useState([]);

    const {show} = useAlert(
        ({msg}) => msg,
        ({type}) => ({[type]: true})
    )

    const dataStoreQuery = {
        dataStore: {
            resource: `dataStore/${config.dataStoreName}?fields=.`,
        }
    };

    const attributesQuery = {
        attributes: {
            resource: `trackedEntityAttributes`,
            params: ({program}) => ({
                fields: ['id', 'displayName', 'optionSet(id)', 'valueType'],
                paging: 'false',
                program: program
            }),
        }
    }

    const dataElementsQuery = {
        programStage: {
            resource: `programStages`,
            id: ({id}) => id,
            params: ({
                fields: 'repeatable, programStageDataElements(dataElement(id, name, valueType, optionSet(id))'
            })
        }
    }

    const entitiesQuery = {
        entities: {
            resource: 'tracker/trackedEntities',
            params: ({orgUnit, program, page, pageSize}) => {
                return ({
                    program: program,
                    orgUnit: orgUnit,
                    pageSize: pageSize,
                    page: page,
                    paging: true,
                    totalPages: true,
                    fields: ['*'],
                })
            }
        }
    }

    const {
        data: elementsData,
        refetch: refetchDataElements
    } = useDataQuery(dataElementsQuery, {variables: {id: selectedStage}});

    const {data: dataStore} = useDataQuery(dataStoreQuery);

    const {
        data: attributesData,
        refetch: attributesRefetch
    } = useDataQuery(attributesQuery, {variables: {program: selectedProgram}});

    useEffect(() => {
        if (dataStore?.dataStore?.entries) {
            let entry = dataStore.dataStore.entries.find(e => e.key === 'activeProgram');
            if (entry) {
                setSelectedProgram(entry.value);
                setSelectedSharedProgram(entry.value);
            }
            entry = dataStore.dataStore.entries.find(e => e.key === 'activeStage');
            if (entry) {
                setSelectedStage(entry.value);
            }
            entry = dataStore.dataStore.entries.find(e => e.key === selectedProgram)
            if (entry) {
                setNameAttributes(entry.value.nameAttributes || []);
                setFilterAttributes(entry.value.filterAttributes || []);
                setConfiguredStages(entry.value.configuredStages || {});
                setEndDateVisible(entry.value.endDateVisible);
                setColumnDisplay(entry.value.columnDisplay);
                setGroupEdit(entry.value.groupEdit);
                setSelectedConfiguredCondition(entry.value.configuredCondition || []);
            }
        }
    }, [dataStore, selectedProgram]);

    useEffect(() => {
        refetchDataElements({id: selectedStage});
        if (elementsData && elementsData.programStage && elementsData.programStage.programStageDataElements) {
            const dataElements = elementsData.programStage.programStageDataElements.map(data => data.dataElement);
            setDataElements(dataElements);
            setRepeatable(elementsData.programStage.repeatable);
        }
        setOriginalEdits([]);
        setEdits([]);
    }, [elementsData, selectedStage, toggle]);

    useEffect(() => {
        if (orgUnit && selectedProgram) {
            setLoading(true);
            engine.query(entitiesQuery, {
                variables: {
                    program: selectedProgram,
                    orgUnit: orgUnit,
                    page,
                    pageSize
                }
            }).then(res => {
                if (res && res.entities) {
                    const entities = sortEntities(res.entities.instances, nameAttributes)
                    setAllEntities(entities);
                    setTotal(res.entities.total);

                    if (filterValue && Object.keys(filterValue).length) {
                        Object.keys(filterValue).forEach(key => {
                            const filteredEntities = entities.filter(entity => {
                                const attribute = entity.attributes.find(attr => attr.attribute === key);
                                return attribute && attribute.value + '' === filterValue[key] + '';
                            });

                            setEntities(filteredEntities);
                        })
                    } else {
                        setEntities(entities);
                    }
                    setLoading(false);
                } else {
                    setEntities([]);
                    setLoading(false)
                }
            });
        }
    }, [orgUnit, selectedProgram, page, pageSize, toggle]);

    useEffect(() => {
        attributesRefetch({program: selectedProgram})
        if (attributesData?.attributes?.trackedEntityAttributes) {
            setEntityAttributes(attributesData?.attributes?.trackedEntityAttributes)
        }
    }, [attributesData, selectedProgram])

    /***
     * Org Units Selection Function. Responsible populating OrgUnitsSelected with selected OrgUnits
     *
     */
    const handleOUChange = event => {
        setOrgUnit(event.id);
        setSelectedSharedOrgUnit(event.id);
        setSelectedOU(event.selected);
        setSelectedSharedOU(event.selected)
        if (!event.checked) {
            setSelectedSharedOrgUnit('')
        }
    };

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
            type: 'update',
            data: value
        }
        engine.mutate(mutation).then(_ => {
            show({msg: i18n.t('Event successfully saved'), type: 'success'});
        });
    }

    const handleProgramChange = (event) => {
        setSelectedProgram(event);
        setSelectedSharedProgram(event);

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

    const stateDateChanged = event => {
        const startDate = new Date(event.calendarDateString)
        setStateDate(startDate);
        calculateDatesBetween(startDate, endDate);
    }

    const endDateChanged = event => {
        const endDate = new Date(event.calendarDateString);
        setEndDate(endDate)
        calculateDatesBetween(startDate, endDate);
    }

    const filterEntities = (filterAttr, value) => {
        const filterAttributes = filterValue;
        filterAttributes[filterAttr] = value;
        setFilterValue(filterAttributes);

        if (value && (value + '').length > 0) {
            const entities = allEntities.filter(entity => {
                const attribute = entity.attributes.find(attr => attr.attribute === filterAttr);
                return attribute && attribute.value + '' === value + '';
            });

            setEntities(entities);
        } else {
            setEntities(allEntities)
        }
    }

    const calculateDatesBetween = (startDate, endDate) => {
        if (endDateVisible) {
            const dates = [];
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            setDates(dates);
        } else {
            setDates([startDate])
        }
    }

    const groupDataElementValue = (dataElement) => {
        return groupValues[dataElement];
    }

    const dataElementValue = (date, dataElement, entity) => {
        let event = entity.enrollments[0].events?.find(event => event.programStage === selectedStage
            && formatDate(event.occurredAt) === formatDate(date.toISOString()));
        const activeEvent = entity.enrollments[0].events?.find(event => event.programStage === selectedStage);
        const editedEntity = edits.find(edit => edit.entity.trackedEntity === entity.trackedEntity);

        if (activeEvent && !repeatable) {
            event = activeEvent;
        }
        if (event) {
            let value;
            if (editedEntity && editedEntity.values.some(v => formatDate(v.date) === formatDate(date) && v.dataElement.id === dataElement)) {
                value = editedEntity.values.find(value => value.dataElement.id === dataElement && formatDate(date) === formatDate(value.date))?.value;
            } else {
                value = event.dataValues.find(dv => dv.dataElement === dataElement)?.value;
            }
            return (value ?? '') + '';

        } else if (editedEntity) {
            return (editedEntity.values.find(value => value.dataElement.id === dataElement && formatDate(date) === formatDate(value.date))?.value ?? '') + '';
        }
        return null;
    }

    const entityValues = (entity) => {
        const edit = edits.find(edit => edit.entity.trackedEntity === entity.trackedEntity);
        if (edit) {
            const values = {};
            edit.values.forEach(value => {
                values [value.dataElement.id]= value.value
            });

            return values;
        }

        return {};
    }

    const saveEdits = () => {
        setSaving(true);
        const events = [];

        const filterValues = (values, formattedDate) => {
            return values.filter(value => formatDate(value.date) === formattedDate);
        }

        const _edits = edits;
        //If group action and an entity has been selected and not edited, add it here
        if (groupEdit) {
            selectedEntities.forEach(entity => {
                if (!edits.find(edit => edit.entity.trackedEntity === entity.trackedEntity)) {
                    _edits.push({
                            entity,
                            values: [{
                                date: startDate
                            }]
                        }
                    );
                }
            })
        }
        //Loop through each edit records and recreate event data for
        _edits.forEach(edit => {
            Map.groupBy(edit.values, ({date}) => formatDate(date)).keys().forEach(eventDate => {
                let event = edit.entity?.enrollments[0].events?.find(event => event.programStage === selectedStage &&
                    formatDate(event.occurredAt) === eventDate);
                const values = filterValues(edit.values, eventDate);
                if (!event) {
                    const existingEvent = edit.entity.enrollments[0].events?.find(event => event.programStage === selectedStage);
                    if (existingEvent && !repeatable) {
                        event = existingEvent;
                    } else {
                        event = {
                            programStage: selectedStage,
                            enrollment: edit.entity.enrollments[0].enrollment,
                            trackedEntity: edit.entity.trackedEntity,
                            orgUnit: edit.entity.orgUnit,
                            occurredAt: values[0].date.toISOString(),
                            dataValues: []
                        }
                    }
                }

                values.forEach(value => {
                    if (value.dataElement) {
                        const dataValue = event.dataValues.find(dv => dv.dataElement === value.dataElement.id) || {};
                        dataValue.dataElement = value.dataElement.id;
                        dataValue.value = (value.value ?? '') + '';
                        if (value.dataElement.valueType === 'TRUE_ONLY' && !value.value) {
                            dataValue.value = null;
                        }
                        if (value.dataElement.valueType.includes('DATE')) {
                            dataValue.value = value.value ? new Date(value.value).toISOString() : '';
                        }

                        const dataValues = event.dataValues.filter(dv => dv.dataElement !== value.dataElement.id) || [];
                        dataValues.push(dataValue);
                        event.dataValues = dataValues;
                    }
                });

                (groupEdit && configuredStages[selectedStage] && configuredStages[selectedStage]['dataElements'] || []).map(de => {
                    return {
                        dataElement: de,
                        value: groupDataElementValue(de)
                    }
                }).forEach(de => {
                    const dataValue = event.dataValues.find(dv => dv.dataElement === de.dataElement) || {};
                    dataValue.dataElement = de.dataElement;
                    dataValue.value = (de.value ?? '') + '';
                    const valueType = dataElements.find(d => d.id === de.dataElement)?.valueType ?? '';
                    if (valueType === 'TRUE_ONLY' && !de.value) {
                        dataValue.value = null;
                    }
                    if (valueType.includes('DATE')) {
                        dataValue.value = de.value ? new Date(de.value).toISOString() : '';
                    }

                    const dataValues = event.dataValues.filter(dv => dv.dataElement !== de.dataElement) || [];
                    dataValues.push(dataValue);
                    event.dataValues = dataValues;
                })

                events.push(event);
            });
        });

        engine.mutate({
            resource: 'tracker',
            type: 'create',
            params: {
                async: false
            },
            data: {
                events
            }
        }).then((response) => {
            if (response.status === 'OK') {
                setEdits([]);
                setSelectedEntities([]);
                setGroupValues({});
                setSaving(false);
                setPage(1);
                setToggle((prev) => !prev);
                show({msg: i18n.t('Data successfully updated'), type: 'success'});
            } else {
                show({msg: i18n.t('There was an error updating records'), type: 'error'});
            }
        }).catch(_ => {
            show({msg: i18n.t('There was an error updating records'), type: 'error'});
            setSaving(false);
        });
    }

    // eslint-disable-next-line max-params
    const createOrUpdateEvent = (entity, date, dataElement, value) => {

        // Validate integer constraints
        if (dataElement.valueType.includes('INTEGER')) {
            value = parseInt(value);
            if (dataElement.valueType === 'INTEGER_ZERO_OR_POSITIVE' && value < 0) {
                alert('Please enter a non-negative integer');
                return;
            }
            if (dataElement.valueType === 'INTEGER_POSITIVE' && value <= 0) {
                alert('Please enter a number greater than 0');
                return;
            }
            if (dataElement.valueType === 'INTEGER_NEGATIVE' && value >= 0) {
                alert('Please enter a number less than 0');
                return;
            }
        }

        setEdits((prevEdits) => {
            const _edits = [...prevEdits];
            let currentEdit = _edits.find
            (edit => edit.entity.trackedEntity === entity.trackedEntity);
            const originalEdit = originalEdits.find(edit => edit.entity.trackedEntity === entity.trackedEntity);

            // Initialize currentEdit if it doesn't exist
            if (!currentEdit) {
                currentEdit = {entity, values: []};
                _edits.push(currentEdit);
            }

            // Filter out the specific `dataValue` for the same `dataElement` and `date`, then add the new `dataValue`
            const newValue = {value, dataElement, date};
            currentEdit.values = [
                ...currentEdit.values.filter(v => !(v.dataElement.id === dataElement.id && formatDate(v.date) === formatDate(date))),
                newValue
            ];

            // Check if currentEdit matches the originalEdit for redo functionality
            const isRevertedToOriginal = originalEdit && originalEdit.values.length === currentEdit.values.length
                && originalEdit.values.every(ov => currentEdit.values.some(
                    cv => cv.dataElement.id === ov.dataElement.id &&
                        formatDate(cv.date) === formatDate(ov.date) &&
                        cv.value === ov.value
                ));


            // If the entity's state has reverted to its original values, remove it from _edits
            const finalEdits = isRevertedToOriginal
                ? _edits.filter(edit => edit.entity.trackedEntity !== entity.trackedEntity)
                : _edits;

            // Add a new original edit if this is the first edit for the entity
            if (!originalEdit) {
                setOriginalEdits(prevOriginalEdits => [...prevOriginalEdits, {...currentEdit}]);
            }

            return finalEdits;
        });
    };

    const createOrUpdateGroupValue = (dataElement, value) => {
        setGroupValues(prevValues => ({
            ...prevValues,
            [dataElement.id]: value,
        }));
    }

    const saveGroupTemplate = () => {
        const template = {
            startDate,
            endDate,
            dataElements: (configuredStages[selectedStage]['dataElements'] || []).map(de => {
                return {
                    dataElement: de,
                    value: groupDataElementValue(de)
                }
            })
        };

        configuredStages[selectedStage]['templates'] = configuredStages[selectedStage]['templates'] || {};
        configuredStages[selectedStage]['templates'][templateName] = template;
        setConfiguredStages(configuredStages);
        setTemplateName('');

        dataStoreOperation('configuredStages', configuredStages);
    }

    const handleTemplateChange = (name) => {
        setSelectedTemplate(name);
        const template = configuredStages[selectedStage]['templates'][name];
        if (template) {
            setStateDate(new Date(template['startDate']));
            setEndDate(new Date(template['endDate']));
            const values = groupValues;
            (template['dataElements'] || []).forEach(de => {
                values[de.dataElement] = de.value;
            })

            setGroupValues(values);
        }
    }

    const referenciasRows = () => {
        return REFERENCIAS_OPTIONS.filter(o => o.active).length + 1;
    }

    const search = (keyword) => {
        if (keyword && keyword.length > 0) {
            const entities = searchEntities(keyword, allEntities, nameAttributes);
            setEntities(entities);
        } else {
            setEntities(allEntities);
        }
    }

    const checkForCondition = async (entity, date, dataElement, value) => {
        const stageHasRule = (configuredCondition || []).some(condition => condition.selectedStage === selectedStage)

        const defaultUpdate = () => {
            if (!groupEdit) {
                createOrUpdateEvent(entity, date, dataElement, value);
            } else {
                createOrUpdateGroupValue(dataElement, value);
            }
        }
        // Ensure that data is available
        if (!stageHasRule) {
            defaultUpdate()
            return;
        }

        const equals = configuredCondition.filter(condition => condition.operator === 'equals');
        if (equals && equals.length > 0) {
            const programStageRules = equals.filter(condition => condition.selectedStage === selectedStage);
            const dataElementRules = programStageRules.filter(condition => condition.dataElement_one === dataElement.id);
            if (dataElementRules.length > 0) {
                for (const rule of dataElementRules) {
                    const dataElementTwo = rule.dataElement_two || '';
                    const checkForDataElementTwo = dataElements.find(item => item.id === dataElementTwo);

                    if (checkForDataElementTwo) {
                        const equalsToValue = rule.equals_to?.toLowerCase() === "true";

                        if (equalsToValue === value && rule.action === 'assign') {

                            if (!groupEdit) {
                                // Await the first createOrUpdateEvent call
                                createOrUpdateEvent(entity, date, checkForDataElementTwo, rule.value_text);

                                // Run the second createOrUpdateEvent after the first completes
                                createOrUpdateEvent(entity, date, dataElement, value);
                            } else {
                                createOrUpdateGroupValue(dataElement, value);
                                createOrUpdateGroupValue(checkForDataElementTwo, rule.value_text);
                            }
                        }
                    }
                }
            } else {
                defaultUpdate();
            }
        } else {
            defaultUpdate();
        }
    };

    const availableStages = () => {
        const stages = [];
        Array.from(Object.keys(configuredStages)).forEach(id => {
            const stage = configuredStages[id];
            if (stage.dataElements && stage.dataElements.length > 0) {
                stages.push(id);
            }
        });

        return stages;
    }
    return (
        <>
            <div className="flex flex-row w-full h-full">
                <div className="page">
                    <Navigation/>
                    <div className="p-6">
                        <div className="mx-auto w-full">
                            <div className="w-full">
                                <div className="w-full flex flex-row pt-2 gap-x-1">
                                    <div
                                        className={orgUnit ? 'w-3/12 flex flex-row card' : 'flex flex-row card w-full'}>
                                        <div className="w-3/12 p-3">
                                            <label htmlFor="stage"
                                                   className="label">
                                                {i18n.t('Event Venue')}
                                            </label>
                                            <OrganisationUnitComponent
                                                handleOUChange={handleOUChange}
                                                selectedOU={selectedOU}
                                            />
                                            {!orgUnit &&
                                                <label className="label pl-2 pt-4 text-sm italic">
                                                    {i18n.t('Select an Org Unit to start attendance recording')}
                                                </label>
                                            }
                                        </div>
                                    </div>
                                    {orgUnit &&
                                        <div className="mx-auto w-full">
                                            <div className="w-full">
                                                <div className="flex flex-col">
                                                    <div className="flex flex-col gap-1 mb-2">
                                                        <div
                                                            className="flex flex-row w-full card p-3 gap-x-1">
                                                            <div className="w-3/12">
                                                                <ProgramComponent
                                                                    selectedProgram={selectedProgram}
                                                                    setSelectedProgram={handleProgramChange}
                                                                    disabled={!selectedSharedOrgUnit}
                                                                />
                                                            </div>
                                                            <div className="w-3/12">
                                                                <ProgramStageComponent
                                                                    selectedProgram={selectedProgram}
                                                                    selectedStage={selectedStage}
                                                                    includeStages={availableStages()}
                                                                    setSelectedStage={(stage) => {
                                                                        setSelectedStage(stage)
                                                                        setSelectedSharedStage(stage)
                                                                        const mutation = {
                                                                            resource: `dataStore/${config.dataStoreName}/activeStage`,
                                                                            type: 'create',
                                                                            data: stage
                                                                        }
                                                                        engine.mutate(mutation).catch(e => {
                                                                            mutation.type = 'update';
                                                                            engine.mutate(mutation);
                                                                        })
                                                                    }
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {Object.keys(filterAttributes).length > 0 &&
                                                        <div className="card p-3 mb-2 w-full gap-x-1">
                                                            <label htmlFor="stage"
                                                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white border-b-2 border-b-gray-800">
                                                                {i18n.t('Entity Filter')}
                                                            </label>
                                                            <div className="p-2 flex flex-row flex-wrap">
                                                                {filterAttributes.map((attr, idx) => {
                                                                    const entityAttribute = entityAttributes.find(ea => ea.id === attr);
                                                                    if (entityAttribute) {
                                                                        return <>
                                                                            <DataElementComponent key={idx}
                                                                                                  dataElement={entityAttribute}
                                                                                                  labelVisible={true}
                                                                                                  optionAdd={false}
                                                                                                  value={filterValue[attr]}
                                                                                                  label={entityAttributes.find(a => a.id === attr)?.displayName}
                                                                                                  valueChanged={(_, v) => filterEntities(attr, v)}/>
                                                                        </>
                                                                    }
                                                                })}
                                                            </div>
                                                        </div>
                                                    }
                                                    {selectedStage &&
                                                        <div className="flex flex-col w-full mb-2">
                                                            <div
                                                                className="w-full card p-3 flex flex-row gap-x-1">
                                                                <div className="w-3/12 flex flex-col">
                                                                    <label
                                                                        className="text-left block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                        {((endDateVisible && repeatable)) ? 'Event Start Date' : 'Event Date'}
                                                                    </label>
                                                                    <CalendarInput
                                                                        label=""
                                                                        calendar="gregory"
                                                                        date={startDate && startDate.toISOString ? startDate?.toISOString().slice(0, 10) : ''}
                                                                        onDateSelect={stateDateChanged}
                                                                    />
                                                                </div>
                                                                {((endDateVisible && repeatable)) &&
                                                                    <div className="w-3/12 flex flex-col">
                                                                        <label
                                                                            className="text-left block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                            {'Event End Date'}
                                                                        </label>
                                                                        <CalendarInput
                                                                            label=""
                                                                            calendar="gregory"
                                                                            date={endDate && endDate.toISOString ? endDate?.toISOString().slice(0, 10) : ''}
                                                                            max={new Date().toISOString().slice(0, 10)}
                                                                            onDateSelect={endDateChanged}
                                                                        />
                                                                    </div>
                                                                }
                                                            </div>
                                                            {entities.length > 0 &&
                                                                <div className="card p-2 pt-4">
                                                                    <div
                                                                        className="flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={groupEdit === true}
                                                                            onChange={(payload) => {
                                                                                setGroupEdit(payload.target.checked);
                                                                            }}
                                                                            className="checkbox"/>
                                                                        <label
                                                                            className="pl-2 pt-2 label">
                                                                            {i18n.t('Group Action?')} <span
                                                                            className="text-xs italic">Action will apply to all selected attendees</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            }
                                                            {groupEdit && selectedStage && dataElements.length > 0 && configuredStages[selectedStage] && (configuredStages[selectedStage]['dataElements'] || []).length > 0 &&
                                                                <div className="w-full flex flex-col pt-2">
                                                                    <div
                                                                        className="p-8 mt-6 lg:mt-0 rounded shadow bg-white">
                                                                        {configuredStages[selectedStage] && Object.keys(configuredStages[selectedStage]['templates'] || {}).length > 0 &&
                                                                            <div className="w-3/12">
                                                                                <label htmlFor="stage"
                                                                                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                                    {i18n.t('Select Saved Event')}
                                                                                </label>
                                                                                <select id="stage"
                                                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                                        value={selectedTemplate}
                                                                                        onChange={(event) => handleTemplateChange(event.target.value)}>
                                                                                    <option selected>Choose event
                                                                                    </option>
                                                                                    {Object.keys(configuredStages[selectedStage]['templates'] || {}).map((name) => (
                                                                                            <option label={name}
                                                                                                    value={name}
                                                                                                    key={name}/>
                                                                                        )
                                                                                    )}
                                                                                </select>
                                                                            </div>
                                                                        }
                                                                        <div
                                                                            className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                                                            <div
                                                                                className={selectedStage === REFERENCIAS ? 'w-8/12 p-2' : 'w-3/12 p-2'}>
                                                                                {![REFERENCIAS, ACTUALIZACAO].includes(selectedStage) && dataElements.length > 0 && configuredStages[selectedStage] && (configuredStages[selectedStage]['dataElements'] || []).map((cde, idx) => {
                                                                                    const de = dataElements.find(de => de.id === cde);
                                                                                    return <>
                                                                                        {de &&
                                                                                            <DataElementComponent
                                                                                                key={idx}
                                                                                                value={groupDataElementValue(cde)}
                                                                                                dataElement={de}
                                                                                                values={groupValues}
                                                                                                stage={selectedStage}
                                                                                                conditions={configuredCondition}
                                                                                                labelVisible={true}
                                                                                                valueChanged={(dataElement, value) => checkForCondition(null, null, dataElement, value)}
                                                                                                setInvalid={(invalid) => setInvalid(invalid)}/>
                                                                                        }
                                                                                    </>
                                                                                })}
                                                                                {selectedStage === REFERENCIAS &&
                                                                                    <table
                                                                                        className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                        <thead>
                                                                                        <tr className="border">
                                                                                            <th colSpan={6}
                                                                                                className="bg-gray-200 text-center">
                                                                                                Referencias
                                                                                                Completas
                                                                                            </th>
                                                                                        </tr>
                                                                                        <tr className="border">
                                                                                            <td colSpan="3"
                                                                                                className="bg-yellow-400 text-center">Referencias
                                                                                                Feitas
                                                                                            </td>
                                                                                            <td colSpan="3"
                                                                                                className="bg-green-400 text-center">Contra
                                                                                                Referencias
                                                                                            </td>
                                                                                        </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                        <ReferenciasComponent
                                                                                            group={true}
                                                                                            groupDataElementValue={groupDataElementValue}
                                                                                            dataElements={dataElements}
                                                                                            stage={selectedStage}
                                                                                            conditions={configuredCondition}
                                                                                            values={groupValues}
                                                                                            valueChange={(e, d, dataElement, value) => checkForCondition(null, null, dataElement, value)}
                                                                                            setInvalid={(invalid) => setInvalid(invalid)}/>
                                                                                        </tbody>
                                                                                    </table>
                                                                                }
                                                                                {selectedStage === ACTUALIZACAO &&
                                                                                    <table className="">
                                                                                        <thead
                                                                                            className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                                                        <tr>
                                                                                            <th colSpan={ACTUALIZACAO_OPTIONS.current.length}
                                                                                                className="text-center p-4">
                                                                                                Seroestado
                                                                                                inicial (Memento
                                                                                                do
                                                                                                Registo)
                                                                                            </th>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            {ACTUALIZACAO_OPTIONS.current.map(c => {
                                                                                                return <>
                                                                                                    <th className="text-center h-48 align-bottom">
                                                                                                        <div
                                                                                                            className="flex justify-center items-end h-full">
                                                                                                        <span
                                                                                                            className="whitespace-nowrap block text-left -rotate-90 w-16 pb-10 pl-4">
                                                                                                            {c.label}
                                                                                                        </span>
                                                                                                        </div>
                                                                                                    </th>
                                                                                                </>
                                                                                            })
                                                                                            }
                                                                                        </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                        <tr>
                                                                                            <ActualizacaoComponent
                                                                                                group={true}
                                                                                                groupDataElementValue={groupDataElementValue}
                                                                                                dataElements={dataElements}
                                                                                                stage={selectedStage}
                                                                                                conditions={configuredCondition}
                                                                                                values={groupValues}
                                                                                                valueChange={(e, d, dataElement, value) => checkForCondition(null, null, dataElement, value)}
                                                                                                setInvalid={(invalid) => setInvalid(invalid)}/>
                                                                                        </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        {configuredStages[selectedStage] && (configuredStages[selectedStage]['dataElements'] || []).length > 0 &&
                                                                            <div
                                                                                className="flex flex-row justify-end pt-2">
                                                                                <button type="button"
                                                                                        className="primary-btn"
                                                                                        onClick={() => setModalShow(true)}>
                                                                                    Create Event Template
                                                                                </button>
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            }
                                                            {selectedStage &&
                                                                <div className="w-full flex flex-col pt-2">
                                                                    <div
                                                                        className="p-8 mt-6 lg:mt-0 rounded shadow bg-white">
                                                                        <div
                                                                            className={loading ? 'opacity-20 relative overflow-x-auto shadow-md sm:rounded-lg' : 'relative overflow-x-auto shadow-md sm:rounded-lg'}>
                                                                            {loading &&
                                                                                <SpinnerComponent/>
                                                                            }
                                                                            <div className="flex-row flex">
                                                                                {allEntities.length > 0 &&
                                                                                    <div className="w-3/12">
                                                                                        <SearchComponent
                                                                                            search={(value) => search(value)}/>
                                                                                    </div>
                                                                                }
                                                                                {((groupEdit && !isObjectEmpty(groupValues) && selectedEntities.length > 0) || (!groupEdit && edits.length > 0)) &&
                                                                                    <div
                                                                                        className="w-9/12 flex flex-row justify-end">
                                                                                        <button type="button"
                                                                                                className={saving || loading || invalid ? 'primary-btn-disabled' : 'primary-btn'}
                                                                                                disabled={saving || loading || invalid}
                                                                                                onClick={saveEdits}>
                                                                                            <div
                                                                                                className="flex flex-row">
                                                                                                {(saving || loading) &&
                                                                                                    <div
                                                                                                        className="pr-2">
                                                                                                        <SpinnerComponent/>
                                                                                                    </div>
                                                                                                }
                                                                                                <span>Save Records</span>
                                                                                            </div>
                                                                                        </button>
                                                                                    </div>
                                                                                }
                                                                            </div>

                                                                            <table
                                                                                className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                                                <caption
                                                                                    className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">

                                                                                    <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">

                                                                                    </p>
                                                                                </caption>
                                                                                <thead
                                                                                    className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                                                <tr className="border">
                                                                                    {groupEdit &&
                                                                                        <th className="px-6 py-6 w-1/12">
                                                                                            <div
                                                                                                className="flex items-center mb-4">
                                                                                                <input
                                                                                                    type="checkbox"
                                                                                                    onChange={(event) => {
                                                                                                        if (event.target.checked) {
                                                                                                            setSelectedEntities(entities)
                                                                                                        } else {
                                                                                                            setSelectedEntities([])
                                                                                                            setEdits([])
                                                                                                        }
                                                                                                    }}
                                                                                                    checked={selectedEntities.length === entities.length}
                                                                                                    className="checkbox"/>
                                                                                            </div>
                                                                                        </th>
                                                                                    }
                                                                                    <th data-priority="1"
                                                                                        rowSpan={!groupEdit && selectedStage === ACTUALIZACAO ? 2 : 1}
                                                                                        className="px-6 py-3 w-1/12 text-center">#
                                                                                    </th>
                                                                                    <th data-priority="2"
                                                                                        rowSpan={!groupEdit && selectedStage === ACTUALIZACAO ? 2 : 1}
                                                                                        className={groupEdit ? 'text-left px-6 py-3 w-10/12' : (!configuredStages[selectedStage] || (configuredStages[selectedStage]['dataElements'] || []).length === 0) ? 'px-6 py-3 w-10/12 text-center' : 'px-6 py-3 w-3/12 text-center'}
                                                                                    >Profile
                                                                                    </th>
                                                                                    {!groupEdit && [REFERENCIAS, ACTUALIZACAO].includes(selectedStage) &&
                                                                                        <>
                                                                                            {selectedStage === REFERENCIAS &&
                                                                                                <>
                                                                                                    <th colSpan={6}
                                                                                                        className="bg-gray-200 text-center">
                                                                                                        Referencias
                                                                                                        Completas
                                                                                                    </th>
                                                                                                </>
                                                                                            }
                                                                                            {selectedStage === ACTUALIZACAO &&
                                                                                                <>
                                                                                                    <th colSpan={2}
                                                                                                        className="text-center p-4">
                                                                                                        Seroestado
                                                                                                        inicial (Memento
                                                                                                        do
                                                                                                        Registo)
                                                                                                    </th>
                                                                                                    <th colSpan={6}
                                                                                                        className="text-center p-4">
                                                                                                        Seroestado
                                                                                                        inicial (Memento
                                                                                                        do
                                                                                                        Registo)
                                                                                                    </th>
                                                                                                </>
                                                                                            }
                                                                                        </>
                                                                                    }
                                                                                    {![REFERENCIAS, ACTUALIZACAO].includes(selectedStage) && !groupEdit && columnDisplay && configuredStages[selectedStage]
                                                                                        && (configuredStages[selectedStage]['dataElements'] || []).map((id, idx) => {
                                                                                            const de = dataElements.find(e => e.id === id);
                                                                                            return <th key={idx}
                                                                                                       rowSpan={5}
                                                                                                       style={{width: `${66.66 / ((configuredStages[selectedStage]['dataElements'] || []).length || 1)}px`}}
                                                                                                       className="px-4 py-3 h-72 border">
                                                                                                <div
                                                                                                    className="flex justify-center items-end h-full">
                                                                                                                <span
                                                                                                                    className="whitespace-nowrap block text-left -rotate-90 w-16 pb-10 pl-2">
                                                                                                                    {de?.name}
                                                                                                                </span>
                                                                                                </div>
                                                                                            </th>
                                                                                        })
                                                                                    }
                                                                                </tr>
                                                                                {selectedStage === ACTUALIZACAO && !groupEdit &&
                                                                                    <tr>
                                                                                        {ACTUALIZACAO_OPTIONS.initial.map(c => {
                                                                                            return <>
                                                                                                <th className={c.conhecido ? 'text-center bg-green-400' : 'text-center bg-red-400'}>
                                                                                                    {c.label}
                                                                                                </th>
                                                                                            </>
                                                                                        })
                                                                                        }
                                                                                        {ACTUALIZACAO_OPTIONS.current.map(c => {
                                                                                            return <>
                                                                                                <th className="text-center h-48 align-bottom">
                                                                                                    <div
                                                                                                        className="flex justify-center items-end h-full">
                                                                                                        <span
                                                                                                            className="whitespace-nowrap block text-left -rotate-90 w-16 pb-10 pl-2">
                                                                                                            {c.label}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </th>
                                                                                            </>
                                                                                        })
                                                                                        }
                                                                                    </tr>
                                                                                }
                                                                                </thead>
                                                                                <tbody>
                                                                                {entities.map((entity, index) => {
                                                                                    return <>
                                                                                        <tr>
                                                                                            {groupEdit &&
                                                                                                <td className="px-6 py-6">
                                                                                                    <div
                                                                                                        className="flex items-center mb-4">
                                                                                                        <input
                                                                                                            type="checkbox"
                                                                                                            checked={selectedEntities.map(e => e.trackedEntity).includes(entity.trackedEntity)}
                                                                                                            onChange={() => {
                                                                                                                if (selectedEntities.map(e => e.trackedEntity).includes(entity.trackedEntity)) {
                                                                                                                    setSelectedEntities(selectedEntities.filter(rowId => rowId.trackedEntity !== entity.trackedEntity));
                                                                                                                } else {
                                                                                                                    setSelectedEntities([...selectedEntities, entity]);
                                                                                                                }
                                                                                                                if (edits.map(e => e.entity.trackedEntity).includes(entity.trackedEntity)) {
                                                                                                                    setEdits(edits.filter(rowId => rowId.entity.trackedEntity !== entity.trackedEntity));
                                                                                                                }
                                                                                                            }}
                                                                                                            className="checkbox"/>
                                                                                                    </div>
                                                                                                </td>
                                                                                            }
                                                                                            <td rowSpan={!groupEdit && selectedStage === REFERENCIAS ? referenciasRows() : 1}>{index + 1}</td>
                                                                                            <td rowSpan={!groupEdit && selectedStage === REFERENCIAS ? referenciasRows() : 1}
                                                                                                className="text-left px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{getParticipant(entity, nameAttributes)}</td>
                                                                                            {!groupEdit && [REFERENCIAS, ACTUALIZACAO].includes(selectedStage) &&
                                                                                                <>
                                                                                                    {selectedStage === REFERENCIAS &&
                                                                                                        <>
                                                                                                            <td colSpan="3"
                                                                                                                className="bg-yellow-400 text-center">Referencias
                                                                                                                Feitas
                                                                                                            </td>
                                                                                                            <td colSpan="3"
                                                                                                                className="bg-green-400 text-center">Contra
                                                                                                                Referencias
                                                                                                            </td>
                                                                                                        </>
                                                                                                    }
                                                                                                </>
                                                                                            }
                                                                                            {![REFERENCIAS].includes(selectedStage) && !groupEdit && configuredStages[selectedStage] && dates.map((date, idx) => {
                                                                                                if (selectedStage !== ACTUALIZACAO) {
                                                                                                    if (!columnDisplay) {
                                                                                                        return <>
                                                                                                            <td key={idx}
                                                                                                                className="px-6 py-4">
                                                                                                                <div
                                                                                                                    className="flex flex-row">
                                                                                                                    <div
                                                                                                                        className="flex flex-col gap-1">
                                                                                                                        {(dataElements.length > 0 && configuredStages[selectedStage]['dataElements'] || []).map((cde, idx) => {
                                                                                                                            const de = dataElements.find(de => de.id === cde);
                                                                                                                            return <>
                                                                                                                                {de &&
                                                                                                                                    <DataElementComponent
                                                                                                                                        key={idx}
                                                                                                                                        value={dataElementValue(date, de.id, entity)}
                                                                                                                                        dataElement={de}
                                                                                                                                        labelVisible={true}
                                                                                                                                        stage={selectedStage}
                                                                                                                                        conditions={configuredCondition}
                                                                                                                                        values={entityValues(entity)}
                                                                                                                                        valueChanged={(dataElement, value) => checkForCondition(entity, date, de, value)}
                                                                                                                                        setInvalid={(invalid) => setInvalid(invalid)}/>
                                                                                                                                }
                                                                                                                            </>
                                                                                                                        })}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </td>
                                                                                                        </>
                                                                                                    } else {
                                                                                                        return <>
                                                                                                            {(configuredStages[selectedStage]['dataElements'] || []).map((id, idx2) => {
                                                                                                                const de = dataElements.find(de => de.id === id);
                                                                                                                return <>
                                                                                                                    <td className="border">
                                                                                                                        {de &&
                                                                                                                            <div
                                                                                                                                className="pl-2">
                                                                                                                                <DataElementComponent
                                                                                                                                    key={idx2}
                                                                                                                                    value={dataElementValue(date, de.id, entity)}
                                                                                                                                    dataElement={de}
                                                                                                                                    labelVisible={false}
                                                                                                                                    stage={selectedStage}
                                                                                                                                    conditions={configuredCondition}
                                                                                                                                    values={entityValues(entity)}
                                                                                                                                    valueChanged={(dataElement, value) => checkForCondition(entity, date, de, value)}
                                                                                                                                    setInvalid={(invalid) => setInvalid(invalid)}/>
                                                                                                                            </div>
                                                                                                                        }
                                                                                                                    </td>
                                                                                                                </>
                                                                                                            })}
                                                                                                        </>
                                                                                                    }
                                                                                                } else {
                                                                                                    return <>
                                                                                                        <ActualizacaoComponent
                                                                                                            dates={dates}
                                                                                                            entity={entity}
                                                                                                            dataElementValue={dataElementValue}
                                                                                                            dataElements={dataElements}
                                                                                                            stage={selectedStage}
                                                                                                            conditions={configuredCondition}
                                                                                                            values={entityValues(entity)}
                                                                                                            valueChange={createOrUpdateEvent}
                                                                                                            setInvalid={(invalid) => setInvalid(invalid)}/>
                                                                                                    </>
                                                                                                }
                                                                                            })}
                                                                                        </tr>
                                                                                        {!groupEdit && selectedStage === REFERENCIAS &&
                                                                                            <ReferenciasComponent
                                                                                                dates={dates}
                                                                                                entity={entity}
                                                                                                dataElementValue={dataElementValue}
                                                                                                dataElements={dataElements}
                                                                                                stage={selectedStage}
                                                                                                conditions={configuredCondition}
                                                                                                values={entityValues(entity)}
                                                                                                valueChange={createOrUpdateEvent}
                                                                                                setInvalid={(invalid) => setInvalid(invalid)}/>
                                                                                        }
                                                                                    </>
                                                                                })}
                                                                                </tbody>
                                                                                <tfoot>
                                                                                <tr>
                                                                                    <th className="w-full p-2"
                                                                                        colSpan={groupEdit ? 4 : 2 + (configuredStages[selectedStage] && configuredStages[selectedStage]['dataElements'] || []).length}>
                                                                                        <div
                                                                                            className="flex flex-row w-full justify-end">
                                                                                            <Pagination
                                                                                                page={page}
                                                                                                pageSize={pageSize}
                                                                                                pageCount={Math.ceil(total / pageSize)}
                                                                                                total={total}
                                                                                                onPageChange={(page) => setPage(page)}
                                                                                                onPageSizeChange={(size) => setPageSize(size)}
                                                                                            />
                                                                                        </div>
                                                                                    </th>
                                                                                </tr>
                                                                                </tfoot>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal hide={!modalShow}>
                <ModalTitle>Event</ModalTitle>

                <ModalContent>
                    <div
                        className="w-full mb-2">
                        <label
                            className="text-left block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Event Name
                        </label>
                        <input
                            type="text"
                            value={templateName}
                            onChange={(event) => setTemplateName(event.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                    </div>
                </ModalContent>

                <ModalActions>
                    <button type="button"
                            className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            onClick={() => {
                                setModalShow(false);
                            }}>
                        Cancel
                    </button>

                    <button type="button"
                            className={classnames(
                                {'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800': !!templateName},
                                {'text-white bg-blue-400 dark:bg-blue-500 cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 text-center': !templateName}
                            )}
                            disabled={!templateName}
                            onClick={() => {
                                setModalShow(false);
                                saveGroupTemplate();
                            }}>
                        Save
                    </button>
                </ModalActions>
            </Modal>
            <Modal hide={!confirmShow}>
                <ModalTitle>Reload profiles</ModalTitle>

                <ModalContent>
                    Click ok to reload data. Any unsaved data will be lost
                </ModalContent>

                <ModalActions>
                    <button type="button"
                            className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            onClick={() => {
                                setConfirmShow(false);
                            }}>
                        Cancel
                    </button>

                    <button type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                            onClick={() => {
                                setConfirmShow(false);
                                setPage(1);
                            }}>
                        Reload
                    </button>
                </ModalActions>
            </Modal>
        </>
    )
}
