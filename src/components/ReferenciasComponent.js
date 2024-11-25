import PropTypes from 'prop-types';
import React from 'react';
import { REFERENCIAS_OPTIONS } from '../consts.js';
import { DataElementComponent } from './DataElement.js';

export const ReferenciasComponent = ({
                                         group,
                                         entity,
                                         dates,
                                         dataElements,
                                         groupDataElementValue,
                                         dataElementValue,
                                         valueChange,
                                         stage,
                                         values,
                                         conditions,
                                         setInvalid
                                     }) => {
    return (
        <>
            {REFERENCIAS_OPTIONS.filter(option => option.active).map(option => {
                return <>
                    <tr>
                        {Object.keys(option.dataElements).map(key => {
                            return <>
                                <td className="px-2 py-1">
                                    {option.label}
                                </td>
                                <td className="px-1 py-1">
                                    {(dates || ['']).map(date => {
                                        const de = dataElements.find(de => de.id === option.dataElements[key].check);
                                        return <>
                                            {de &&
                                                <div
                                                    className="pl-2">
                                                    <DataElementComponent
                                                        value={group ? groupDataElementValue(de.id) : dataElementValue(date, de.id, entity)}
                                                        dataElement={de}
                                                        labelVisible={false}
                                                        stage={stage}
                                                        conditions={conditions}
                                                        values={values}
                                                        valueChanged={(d, v) => valueChange(entity, date, de, v)}
                                                        setInvalid={(invalid) => setInvalid(invalid)}/>
                                                </div>
                                            }
                                        </>
                                    })
                                    }
                                </td>
                                <td className="px-1 py-1">
                                    {(dates || ['']).map(date => {
                                        const de = dataElements.find(de => de.id === option.dataElements[key].date);
                                        return <>
                                            {de &&
                                                <div
                                                    className="pl-2">
                                                    <DataElementComponent
                                                        value={group ? groupDataElementValue(de.id) : dataElementValue(date, de.id, entity)}
                                                        dataElement={de}
                                                        labelVisible={false}
                                                        stage={stage}
                                                        conditions={conditions}
                                                        values={values}
                                                        valueChanged={(d, v) => valueChange(entity, date, de, v)}
                                                        setInvalid={(invalid) => setInvalid(invalid)}/>
                                                </div>
                                            }
                                        </>
                                    })
                                    }
                                </td>
                            </>
                        })
                        }
                    </tr>
                </>
            })}
        </>
    )
}

ReferenciasComponent.propTypes = {
    conditions: PropTypes.array,
    dataElementValue: PropTypes.func,
    dataElements: PropTypes.array,
    dates: PropTypes.array,
    entity: PropTypes.object,
    group: PropTypes.bool,
    groupDataElementValue: PropTypes.func,
    setInvalid: PropTypes.func,
    stage: PropTypes.string,
    valueChange: PropTypes.func,
    values: PropTypes.object
}
