import { useAlert, useDataEngine } from '@dhis2/app-runtime';
import i18n from '@dhis2/d2-i18n';
import { CalendarInput } from '@dhis2/ui';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { applyConditionAction } from '../utils.js';

export const DataElementComponent = ({
                                         dataElement,
                                         labelVisible = true,
                                         label,
                                         value,
                                         values,
                                         stage,
                                         conditions,
                                         valueChanged,
                                         readonly,
                                         optionAdd = true
                                     }) => {
    const engine = useDataEngine();

    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [options, setOptions] = useState([]);
    const [valueType, setValueType] = useState('');
    const [edit, setEdit] = useState(false);
    const [optionLabel, setOptionLabel] = useState('');
    const [optionValue, setOptionValue] = useState();
    const [error, setError] = useState('');
    const [optionSetId, setOptionSetId] = useState('');
    const [visible, setVisible] = useState(true);
    const [enabled, setEnabled] = useState(true);
    const [warning, setWarning] = useState(false);
    const [elementValue, setElementValue] = useState(null);
    const memorizedOptionSetId = useMemo(() => optionSetId, [optionSetId]);

    const {show} = useAlert(
        ({msg}) => msg,
        ({type}) => ({[type]: true})
    )

    useEffect(() => {
        if (dataElement?.optionSet?.id && dataElement?.optionSet.id !== optionSetId) {
            setOptionSetId(dataElement?.optionSet.id);
        }
    }, [dataElement, optionSetId]);

    useEffect(() => {
        const condition = applyConditionAction(conditions, stage, dataElement, values, elementValue);
        if (condition.action === 'disable') {
            setEnabled(false);
        } else {
            setEnabled(true);
        }
        if (condition.action === 'hide') {
            setVisible(false);
        } else {
            setVisible(true);
        }
        if (condition.action === 'show_warning') {
            setWarning(true);
        } else {
            setWarning(false);
        }
    }, [values, conditions, stage, dataElement, elementValue]);

    useEffect(() => {
        if (warning) {
            if (warning) {
                show({msg: i18n.t('Value cannot be updated as conditions not met'), type: 'error'});
                valueChanged(dataElement, '');
            }
        }
    }, [warning]);

    useEffect(() => {
        if (optionSetId) {
            const optionsQuery = {
                optionSet: {
                    resource: 'optionSets',
                    id: optionSetId,
                    params: {
                        fields: 'id,name,valueType,options(id,code,displayName)',
                    }
                }
            };
            engine.query(optionsQuery).then(d => {
                setOptions(d.optionSet?.options.filter(o => !!o) || []);
                setValueType(d.optionSet?.valueType);
                setId(d.optionSet?.id);
                setName(d.optionSet?.name);
            });
        }
    }, [memorizedOptionSetId]);

    const addOption = () => {
        const option = {
            displayName: optionLabel,
            code: valueType.includes('TEXT') ? optionLabel : null
        };
        const existing = options.find(option => option.displayName.replace(/\s+/g, ' ').trim().toLowerCase() === optionLabel.toLowerCase());
        if (existing) {
            setOptionValue(existing.code);
            setEdit(false);
            valueChanged(dataElement, existing.code);
        } else {
            if (valueType === 'INTEGER_POSITIVE' || valueType === 'INTEGER') {
                const next = Math.max(...options.map(o => parseInt(o.code))) + 1;
                option.code = next + '';
            }
            if (valueType === 'NEGATIVE_POSITIVE') {
                const next = Math.min(...options.map(o => parseInt(o.code))) - 1;
                option.code = next + '';
            }

            if (id) {
                engine.mutate({
                    resource: 'options',
                    type: 'create',
                    data: {
                        name: option.displayName,
                        code: option.code
                    }
                }).then(res => {
                    if (res.status === 'OK') {
                        option.id = res.response.uid;
                        options.push(option);
                        const optionSet = {
                            optionSets: [
                                {
                                    id,
                                    name,
                                    valueType,
                                    options
                                }
                            ]
                        };
                        engine.mutate({
                            resource: 'metadata',
                            type: 'create',
                            data: optionSet
                        }).then(res => {
                            if (res.status === 'OK') {
                                setOptionValue(option.code);
                                setEdit(false);
                                valueChanged(dataElement, option.code);
                            }
                        });
                    }
                });
            }
        }
    }

    const validateNumericInput = (event) => {
        const inputValue = event.target.value;
        let valid = false;

        if (valueType === 'INTEGER_ZERO_OR_POSITIVE') {
            const value = parseInt(inputValue);
            valid = value >= 0;
        } else if (valueType === 'INTEGER_NEGATIVE') {
            const value = parseInt(inputValue);
            valid = value < 0;
        } else if (valueType === 'INTEGER_POSITIVE') {
            const value = parseInt(inputValue);
            valid = value > 0;
        }
        if (!valid) {
            setError('Invalid input');
            return false;
        }
        setError('');
        return true;
    };

    const updateValue = (value) => {
        setElementValue(value);
        valueChanged(dataElement, value);
    }

    return (
        <>
            <div>
                {dataElement?.optionSet?.id && visible &&
                    <div className="flex flex-col">
                        {labelVisible &&
                            <label className="label">
                                {label || dataElement.name || dataElement.displayName}
                            </label>
                        }
                        <div className="flex flex-row">
                            <select className="select"
                                    value={value ?? optionValue ?? ''}
                                    disabled={readonly || !enabled}
                                    onChange={(event) => {
                                        setEdit(false);

                                        updateValue(event.target.value);
                                    }}>
                                <option defaultValue={''}>Select one</option>
                                {options.filter(option => !!option).map(option => (
                                    <option key={option.code} value={option.code}>
                                        {option.displayName}
                                    </option>
                                ))}
                            </select>
                            {!edit && !readonly && optionAdd && enabled &&
                                <div className="p-2" onClick={() => setEdit(true)}>+</div>
                            }
                        </div>
                        {edit &&
                            <div className="flex flex-row pt-2 gap-2">
                                <div className="w-9/12">
                                    <input
                                        type="text"
                                        onChange={(event) => {
                                            setOptionLabel(event.target.value.replace(/\s+/g, ' ').trim())
                                        }}
                                        className="text-input"/>
                                </div>
                                {optionLabel &&
                                    <button type="button" onClick={addOption} className="primary-btn">
                                        Add
                                    </button>
                                }
                                <button type="button" onClick={() => setEdit(false)} className="default-btn">
                                    Cancel
                                </button>
                            </div>
                        }
                    </div>
                }
                {!dataElement.optionSet?.id && visible &&
                    <>
                        {((dataElement.valueType === 'TRUE_ONLY' || dataElement.valueType === 'BOOLEAN')) &&
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    disabled={readonly || !enabled}
                                    checked={value === true || value === 'true'}
                                    onChange={(event) => updateValue(event.target.checked)}
                                    className="checkbox"/>
                                {labelVisible &&
                                    <label className="label pl-2 pt-2">
                                        {label || dataElement.name || dataElement.displayName}
                                    </label>
                                }
                            </div>
                        }

                        {((dataElement.valueType.includes('INTEGER') || dataElement.valueType === 'NUMBER')) &&
                            <div className="mb-5">
                                {labelVisible &&
                                    <label className="text-left label">
                                        {label || dataElement.name || dataElement.displayName}
                                    </label>
                                }
                                <input
                                    type="number"
                                    value={value ?? ''}
                                    disabled={readonly || !enabled}
                                    onChange={(event) => {
                                        if (validateNumericInput(event)) {
                                            updateValue(event.target.value);
                                        }
                                    }}
                                    className="text-input"/>
                                {error && <span style={{color: 'red'}}>{error}</span>}
                            </div>
                        }
                        {(dataElement.valueType.includes('TEXT')) &&
                            <div className="mb-5">
                                {labelVisible &&
                                    <label className="text-left label">
                                        {label || dataElement.name || dataElement.displayName}
                                    </label>
                                }
                                <input
                                    type="text"
                                    value={value ?? ''}
                                    disabled={readonly || !enabled}
                                    onChange={(event) => updateValue(event.target.value)}
                                    className="text-input"/>
                            </div>
                        }
                        {(dataElement.valueType.includes('DATE')) &&
                            <div className="mb-2 flex flex-col">
                                {labelVisible &&
                                    <label className="text-left label">
                                        {label || dataElement.name || dataElement.displayName}
                                    </label>
                                }
                                <CalendarInput
                                    calendar="gregory"
                                    label=""
                                    disabled={readonly || !enabled}
                                    date={(value ?? '').substring(0, 10)}
                                    onDateSelect={(event) => updateValue(new Date(event.calendarDateString).toISOString())}
                                />
                            </div>
                        }
                    </>
                }
            </div>
        </>
    );
}

DataElementComponent.propTypes = {
    conditions: PropTypes.array,
    dataElement: PropTypes.object,
    label: PropTypes.string,
    labelVisible: PropTypes.bool,
    optionAdd: PropTypes.bool,
    readonly: PropTypes.bool,
    stage: PropTypes.bool,
    value: PropTypes.string,
    valueChanged: PropTypes.func,
    values: PropTypes.object,
};
