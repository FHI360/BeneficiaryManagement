import i18n from '@dhis2/d2-i18n';
import PropTypes from 'prop-types';
import React from 'react';
import ArrowDown from '../icons/arrow-down.svg';
import ArrowUp from '../icons/arrow-up.svg';

export const DataElementSortComponent=({stages, selectedStage, checkDataElements, dataElements, moveDataElement, onClose})=> {
    return (
        <>
            <div className="p-8 mt-6 lg:mt-0 card">
                <div
                    className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table
                        className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <caption
                            className="p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-white dark:text-white dark:bg-gray-800">
                            {stages.find(stage => stage.id === selectedStage)?.displayName}
                            <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                {i18n.t('Click the up or down arrow to sort the ordering of the data elements during display')}
                            </p>
                        </caption>
                        <thead
                            className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th data-priority="1" className="px-6 py-3 w-1/12">#</th>
                            <th data-priority="2" className="px-6 py-3 w-9/12 text-left">
                                Data Element
                            </th>
                            <th className="w-2/12"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {(checkDataElements || []).map((dataElement, index) => {
                            return <>
                                <tr>
                                    <td>{index + 1}</td>
                                    <td className="text-left px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{dataElements.find(de => de.id === dataElement)?.name}</td>
                                    <td>
                                        <div className="flex flex-row">
                                            {index < ((checkDataElements || []).length - 1) &&
                                                <div
                                                    onClick={() => moveDataElement(index, index + 1)}>
                                                    <img width={24} src={ArrowDown}/>
                                                </div>
                                            }
                                            {index === ((checkDataElements || []).length - 1) &&
                                                <div className="w-6"></div>
                                            }
                                            {index > 0 &&
                                                <div
                                                    onClick={() => moveDataElement(index, index - 1)}>
                                                    <img width={24} src={ArrowUp}/>
                                                </div>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            </>
                        })}
                        </tbody>
                        <tfoot>
                        <tr className="font-semibold text-gray-900 dark:text-white">
                            <th colSpan={2} className="px-6 py-3 text-base">
                                <button type="button"
                                        className="primary-btn"
                                        onClick={onClose}>Save
                                </button>
                            </th>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </>
    )
}

DataElementSortComponent.propTypes = {
    checkDataElements: PropTypes.array.isRequired,
    dataElements: PropTypes.array.isRequired,
    moveDataElement: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedStage: PropTypes.string,
    stages: PropTypes.array
}