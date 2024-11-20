import PropTypes from 'prop-types';
import React from 'react';
import { ACTUALIZACAO_OPTIONS } from '../consts.js';
import { DataElementComponent } from './DataElement.js';

export const ActualizacaoComponent = ({
                                          group,
                                          entity,
                                          dates,
                                          dataElements,
                                          groupDataElementValue,
                                          dataElementValue,
                                          valueChange,
                                          selectedStage,
                                          conditions,
                                          values
                                      }) => {

    const initialValue = (entity, item) => {
        const attributes = entity.enrollments?.[0]?.attributes || entity.attributes;
        return item.conhecido
            ? attributes?.find(attribute => attribute.attribute === ACTUALIZACAO_OPTIONS.conhecido)?.value
            : attributes?.find(attribute => attribute.attribute === ACTUALIZACAO_OPTIONS.naoConhecido)?.value;
    }

    return (
        <>
            {/* Render initial options */}
            {!group && (dates || ['']).map((_, dateIndex) => (
                <React.Fragment key={`initial-options-${dateIndex}`}>
                    {ACTUALIZACAO_OPTIONS.initial
                        .sort((a, b) => (a.conhecido && !b.conhecido ? -1 : !a.conhecido && b.conhecido ? 1 : 0))
                        .map((i, index) => {
                            const de = dataElements.find(de => de.id === i.id);
                            const value = initialValue(entity, i);

                            return (
                                de && (
                                    <td className="px-1 py-1" key={`initial-${index}`}>
                                        <div className="pl-2">
                                            <DataElementComponent
                                                value={value}
                                                dataElement={de}
                                                labelVisible={false}
                                                readonly={true}
                                            />
                                        </div>
                                    </td>
                                )
                            );
                        })}
                </React.Fragment>
            ))}

            {/* Render current options */}
            {(dates || ['']).map((date, dateIndex) => (
                <React.Fragment key={`current-options-${dateIndex}`}>
                    {ACTUALIZACAO_OPTIONS.current.map((c, index) => {
                        const de = dataElements.find(de => de.id === c.id);
                        return (
                            de && (
                                <td className="px-1 py-1" key={`current-${index}`}>
                                    <div className="pl-2">
                                        <DataElementComponent
                                            value={group ? groupDataElementValue(de.id) : dataElementValue(date, de.id, entity)}
                                            dataElement={de}
                                            labelVisible={false}
                                            stage={selectedStage}
                                            conditions={conditions}
                                            values={values}
                                            valueChanged={(d, v) => {
                                                ACTUALIZACAO_OPTIONS.initial
                                                    .map((i) => {
                                                        const dataElement = dataElements.find(de => de.id === i.id);
                                                        const value = initialValue(entity, i);
                                                        if (!group && value) {
                                                            valueChange(entity, date, dataElement, value);
                                                        }
                                                    })

                                                valueChange(entity, date, de, v);
                                            }
                                            }
                                        />
                                    </div>
                                </td>
                            )
                        );
                    })}
                </React.Fragment>
            ))}
        </>
    );
};

ActualizacaoComponent.propTypes = {
    dataElements: PropTypes.array.isRequired,
    conditions: PropTypes.array,
    dataElementValue: PropTypes.func,
    dates: PropTypes.array,
    entity: PropTypes.object,
    group: PropTypes.bool,
    groupDataElementValue: PropTypes.func,
    selectedStage: PropTypes.string,
    valueChange: PropTypes.func,
    values: PropTypes.object
};
