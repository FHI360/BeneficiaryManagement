import { useAlert } from '@dhis2/app-runtime'
import { Transfer } from '@dhis2/ui';
import { SingleSelect, SingleSelectOption } from '@dhis2-ui/select'
import {  IconDelete16} from '@dhis2/ui-icons'; 
import TooltipComponent from './TooltipComponent.js';
import { generateRandomId } from '../utils.js';
import {
    Table,
    TableHead,
    TableRowHead,
    TableCellHead,
    TableBody,
    TableRow,
    TableCell,
  } from '@dhis2/ui';
import React, { useContext, useEffect, useState } from 'react';
import { Modal, ModalTitle, ModalContent, ModalActions, ButtonStrip, Button } from '@dhis2/ui';


const ConfigureCondition = ({dataElements, selectedCondition, configuredCondition, setShowConditionsModal, setSelectedConfiguredCondition, setDeleteAction, selectedStage}) => {
    // console.log('I am here')
    // console.log('dataElements:', dataElements)
    const { show } = useAlert(
        ({ msg }) => msg,
        ({ type }) => ({ [type]: true })
      )
    const [dataElements_, setDataElements] = useState([]);
    const [loading, setLoading] = useState(false)
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectedKeysReady, setSelectedKeysReady] = useState([]);
    const [selectedVariable1, setSelectedVariable1] = useState("");
    const [selectedVariable2, setSelectedVariable2] = useState("");
    const [selectedOperator, setSelectedOperator] = useState("");
    const [selectedAction, setSelectedAction] = useState("");
    const [value_text, set_value_text]=useState("")
    const [equals_value_text, set_equals_value_text]=useState("")
    const [saveCondition, setSaveCondition] =useState(false)
    const [conditionExists_, setConditionExists] =useState(false)
    const [condition_, setCondition] =useState([])
    const [triggerSaving_, setTriggerSaving_] =useState(true)


    useEffect(()=> {
        console.log('configuredCondition: ', configuredCondition)

    },[configuredCondition])
    useEffect(()=>{
            // If condition doesn't exist, create new and add to array
            console.log('condition_: ', condition_)
            
            if (conditionExists_ === true) {
                setSelectedConfiguredCondition(prevSelected => [...prevSelected, condition_])
                setSaveCondition(false)
                console.log("Condition Created");

                    show({ msg: `Condition Created Successfully.`, type: 'success' })
                
                

    
            }

    },[triggerSaving_])

    useEffect(() => {
        if(saveCondition){
            console.log('saveCondition: ', saveCondition)
            if (selectedOperator === 'between'){
                if (selectedVariable1.length > 0 && 
                    selectedVariable2.length > 0 && 
                    selectedAction.length > 0 && 
                    value_text.length > 0 && 
                    selectedOperator.length > 0 )
                        {
                            const condition = 
                                {   
                                    "selectedStage":selectedStage || '',
                                    "dataElement":selectedCondition,
                                    "conditionID":selectedCondition+"_"+generateRandomId(),
                                    "dataElement_one": selectedVariable1, 
                                    "dataElement_two": selectedVariable2, 
                                    "operator": selectedOperator,            
                                    "value_text": value_text,
                                    "action": selectedAction
                                }
                                setCondition(condition)
                            
                                    // Check if an identical condition exists in the array
                                const conditionExists = configuredCondition.find(condition =>
                                    condition.dataElement === selectedCondition &&
                                    condition.dataElement_one === selectedVariable1 &&
                                    condition.dataElement_two === selectedVariable2 &&
                                    condition.operator === selectedOperator &&
                                    condition.value_text === value_text &&
                                    condition.action === selectedAction
                                );
                                if(conditionExists === false) {
                                    show({ msg: `An identical condition already exists:`, type: 'warning' })
                                    
                                }
                                setConditionExists(!conditionExists)
                                console.log(conditionExists)
                                setTriggerSaving_(prev => !prev)    
                                
                        }
                else{
                    console.log("No missing field is allowed")
                    return
                }
            }
            if (selectedOperator === 'equals'){
                if (selectedVariable1.length > 0 && 
                    selectedVariable2.length > 0 && 
                    selectedAction.length > 0 && 
                    value_text.length > 0 && 
                    selectedOperator.length > 0 &&
                    equals_value_text.length > 0 )
                        {
                            const condition = 
                                {   
                                    "selectedStage":selectedStage || '',
                                    "dataElement":selectedCondition,
                                    "conditionID":selectedCondition+"_"+generateRandomId(),
                                    "dataElement_one": selectedVariable1, 
                                    "dataElement_two": selectedVariable2, 
                                    "operator": selectedOperator,            
                                    "value_text": value_text,
                                    "equals_to":equals_value_text,
                                    "action": selectedAction
                                }
                                setCondition(condition)
                            
                                    // Check if an identical condition exists in the array
                                const conditionExists = configuredCondition.find(condition =>
                                    condition.dataElement === selectedCondition &&
                                    condition.dataElement_one === selectedVariable1 &&
                                    condition.dataElement_two === selectedVariable2 &&
                                    condition.operator === selectedOperator &&
                                    condition.value_text === value_text &&
                                    condition.equals_to === equals_value_text &&
                                    condition.action === selectedAction
                                );
                                if(conditionExists === false) {
                                    show({ msg: `An identical condition already exists:`, type: 'warning' })
                                    
                                }
                                setConditionExists(!conditionExists)
                                console.log(conditionExists) 
                                setTriggerSaving_(prev => !prev)   
                                
                        }
                else{
                    show({ msg: `No missing field is allowed`, type: 'warning' })
                    return
                }
            }


        }
    }, [saveCondition]);

    const operators = [
                {
                    "label": "equals",
                    "value": "equals"
                },
                {
                    "label": "greater than",
                    "value": "greater_than"
                },
                {
                    "label": "less than",
                    "value": "less_than"
                },
                {
                    "label": "between",
                    "value": "between"
                },
                {
                    "label": "is_empty",
                    "value": "is_empty"
                }
        ]

    const actions = [
            {
                "label": "Show Data Element",
                "value": "show_data_element"
            },
            {
                "label": "Hide",
                "value": "hide"
            },
            {
                "label": "Assign",
                "value": "assign"
            },
            {
                "label": "Disable",
                "value": "disable"
            },
            {
                "label": "Show Warning",
                "value": "show_warning"
            }
    ]



    useEffect(() => {
        // const de_ = dataElements?.filter(selectedDataElement=>selectedDataElement.id !== selectedCondition) || []
        
        // const mapped_de_ = de_?.map(dataElement => {
        //     return {
        //         label: dataElement.name,
        //         value: dataElement.id
        //     };
        // });

        const mapped_de_ = dataElements?.map(dataElement => {
            return {
                label: dataElement.name,
                value: dataElement.id
            };
        });

        setDataElements(mapped_de_)

    }, [dataElements]);



    


    // Function to hide field
    const hideField = () => {
    };

    // Function to show field
    const showField = () => {
    };

    // Function to map field
    const mapField = () => {
    };

    // Function to create field
    const createCondition = () => {
        setSaveCondition(true)

    };

    const handleCloseModal = () => {
        setShowConditionsModal(false);            
    };

    const handleTransferAction = (selected) => {

        setSelectedVariable1("")
        setSelectedVariable2("")
        setSelectedOperator("")
        setSelectedAction("")
        set_value_text("")
        set_equals_value_text("")

        console.log(dataElements_)
        // Filter the dataElement_ array to only include elements with values in the selected array
        const filteredDataElements = dataElements_.filter(element =>
            selected.includes(element.value)
        );
        
        if (filteredDataElements.length < 3){
            setSelectedKeys(selected)
            console.log(filteredDataElements.length);
            setSelectedKeysReady(filteredDataElements);
        }else{
            console.log("Only 2 Options Can be Selected")
        }
        
        console.log(selectedKeysReady);

    };
    const handleRemoveCondition = (condition_id) => {

        setDeleteAction(true)
        const filteredConditions = configuredCondition?.filter(condition => condition.conditionID !== condition_id)
        console.log('deleted: ', filteredConditions)
        setSelectedConfiguredCondition([...filteredConditions])

        console.log(condition_id, "Delete Condition from Conditions")
    }
    const handleActionDataElement = (selected, variable) => {

        if (variable === 'var1'){
            setSelectedVariable1(selected); 
        }
        if (variable === 'var2'){
            setSelectedVariable2(selected); 
        }
        if(variable == 'operator'){
            if (selected === 'greater_than'){
                console.log("Not implemented yet")
            }
            if (selected === 'less_than'){
                console.log("Not implemented yet")
            }
            if (selected === 'empty'){
                console.log("Not implemented yet")
            }
            if (selected === 'between'){
                console.log("Not implemented")
            }
            
            setSelectedOperator(selected)
        }
        if(variable == 'action'){
            setSelectedAction(selected)
        }
        
      
    };
    
    // Function to get label from value
    const getLabelByValue = (value) => {
        const element = dataElements_.find(el => el.value === value);
        return element ? element.label : value;
    };

    return (
        <div>
        <Modal fluid onClose={handleCloseModal}>
                <ModalTitle>
                Rule Panel

                </ModalTitle>
                <ModalContent>
                <div className="p-5">

                    Select Data Elements for Rules
                <Transfer
                    // filterable
                    // filterablePicked
                    leftHeader={<div className="p-2 font-semibold">Data Elements</div>}

                    rightHeader={<div className="p-2 font-semibold">Selected Data Elements(s)</div>}
                    // loading={loading}        
                    enableOrderChange
                    options={dataElements_}
                    selected={selectedKeys}
                    onChange={({ selected }) => {
                        handleTransferAction(selected);
                    }}
                    // selectedEmptyComponent={<p style={{textAlign: 'center'}}>You have not selected anything yet<br /></p>}
                />

                </div>
                <div className="p-5">
                Configure New Actions
                <SingleSelect
                                                                filterable
                                                                noMatchText="No operator found"
                                                                placeholder="Select .. "
                                                                selected={selectedOperator} 
                                                                value={selectedOperator}
                                                                onChange={({ selected }) => handleActionDataElement(selected, "operator")}
                                                                // disabled={disabled}
                                                            >
                                                                {operators.map(operator => (
                                                                <SingleSelectOption key={operator.value} label={operator.label} value={operator.value} />
                                                                ))}
                
                                                           </SingleSelect>
                {selectedOperator === 'between' && <Table
                className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">

                <TableHead className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <TableRowHead className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                        <TableCellHead>Variable 1</TableCellHead>
                        <TableCellHead>Operator</TableCellHead>
                        <TableCellHead>Variable 2</TableCellHead>
                        <TableCellHead>Value</TableCellHead>
                        <TableCellHead>Action</TableCellHead>
                    </TableRowHead>
                </TableHead>
                <TableBody>

                
                                                        
                                                        <TableRow>
                                                            <TableCell>

                                                            <SingleSelect
                                                                filterable
                                                                noMatchText="No data element found"
                                                                placeholder="Select .. "
                                                                selected={selectedVariable1 || ""}
                                                                value={selectedVariable1 || "" }
                                                                onChange={({ selected }) => handleActionDataElement(selected, "var1")}
                                                                // disabled={disabled}
                                                            >
                                                                {selectedKeysReady.map(de => (
                                                                <SingleSelectOption key={de.value} label={de.label} value={de.value} />
                                                                ))}
                                                            </SingleSelect>

                                                            </TableCell>
                                                            <TableCell>

                                                            <SingleSelect
                                                                filterable
                                                                noMatchText="No operator found"
                                                                placeholder="Select .. "
                                                                selected={selectedOperator} 
                                                                value={selectedOperator}
                                                                onChange={({ selected }) => handleActionDataElement(selected, "operator")}
                                                                // disabled={disabled}
                                                            >
                                                                {operators.map(operator => (
                                                                <SingleSelectOption key={operator.value} label={operator.label} value={operator.value} />
                                                                ))}
                                                            </SingleSelect>


                                                            </TableCell>
                                                            <TableCell>
                                                                


                                                            <SingleSelect
                                                                filterable
                                                                noMatchText="No data element found"
                                                                placeholder="Select .."
                                                                selected={selectedVariable2 || ""}
                                                                value={selectedVariable2 || ""}
                                                                onChange={({ selected }) => handleActionDataElement(selected, "var2")}
                                                                // disabled={disabled}
                                                            >
                                                                {selectedKeysReady.map(de => (
                                                                <SingleSelectOption key={de.value} label={de.label} value={de.value} />
                                                                ))}
                                                            </SingleSelect>


                                                            </TableCell>
                                                            <TableCell>

                                                            <input
                                                                type="text"
                                                                value={value_text}
                                                                onChange={(event) => set_value_text(event.target.value)}
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                                                
                                                            </TableCell>
                                                            <TableCell>

                                                            
                                                            <SingleSelect
                                                                filterable
                                                                noMatchText="No data element found"
                                                                placeholder="Select .."
                                                                selected={selectedAction}
                                                                value={selectedAction}
                                                                onChange={({ selected }) => handleActionDataElement(selected, "action")}
                                                                // disabled={disabled}
                                                            >
                                                                {actions.map(action => (
                                                                <SingleSelectOption key={action.value} label={action.label} value={action.value} />
                                                                ))}
                                                            </SingleSelect>
                                                            </TableCell>
                                                            
                                                        </TableRow>
                                                            
         
                </TableBody>
                </Table>} 
                
                {selectedOperator === 'equals' && 
                <Table
                                                        className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">

                                                        <TableHead className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                            <TableRowHead className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                                                <TableCellHead>Variable 1</TableCellHead>
                                                                <TableCellHead>Operator</TableCellHead>
                                                                <TableCellHead>Equal to Value</TableCellHead>
                                                                <TableCellHead>Action</TableCellHead>
                                                                <TableCellHead>Assign</TableCellHead>
                                                                <TableCellHead>Variable 2</TableCellHead>
                                                            </TableRowHead>
                                                        </TableHead>
                                                        <TableBody>

                
                                                        
                                                        <TableRow>
                                                            <TableCell>

                                                            <SingleSelect
                                                                filterable
                                                                noMatchText="No data element found"
                                                                placeholder="Select .. "
                                                                selected={selectedVariable1 || ""}
                                                                value={selectedVariable1 || "" }
                                                                onChange={({ selected }) => handleActionDataElement(selected, "var1")}
                                                                // disabled={disabled}
                                                            >
                                                                {selectedKeysReady.map(de => (
                                                                <SingleSelectOption key={de.value} label={de.label} value={de.value} />
                                                                ))}
                                                            </SingleSelect>

                                                            </TableCell>
                                                            <TableCell>

                                                            <SingleSelect
                                                                filterable
                                                                noMatchText="No operator found"
                                                                placeholder="Select .. "
                                                                selected={selectedOperator} 
                                                                value={selectedOperator}
                                                                onChange={({ selected }) => handleActionDataElement(selected, "operator")}
                                                                // disabled={disabled}
                                                            >
                                                                {operators.map(operator => (
                                                                <SingleSelectOption key={operator.value} label={operator.label} value={operator.value} />
                                                                ))}
                                                            </SingleSelect>


                                                            </TableCell>

                                                            <TableCell>

                                                                <input
                                                                    type="text"
                                                                    value={equals_value_text}
                                                                    onChange={(event) => set_equals_value_text(event.target.value)}
                                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                                                    
                                                            </TableCell>
                                                            
                                                            <TableCell>

                                                            
                                                                <SingleSelect
                                                                    filterable
                                                                    noMatchText="No data element found"
                                                                    placeholder="Select .."
                                                                    selected={selectedAction}
                                                                    value={selectedAction}
                                                                    onChange={({ selected }) => handleActionDataElement(selected, "action")}
                                                                    // disabled={disabled}
                                                                >
                                                                    {actions.map(action => (
                                                                    <SingleSelectOption key={action.value} label={action.label} value={action.value} />
                                                                    ))}
                                                                </SingleSelect>
                                                            </TableCell>                             
                                                            <TableCell>

                                                            <input
                                                                type="text"
                                                                value={value_text}
                                                                onChange={(event) => set_value_text(event.target.value)}
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                                                
                                                            </TableCell>
                                                            <TableCell>
                                                                <SingleSelect
                                                                    filterable
                                                                    noMatchText="No action found"
                                                                    placeholder="Select .."
                                                                    selected={selectedVariable2 || ""}
                                                                    value={selectedVariable2 || ""}
                                                                    onChange={({ selected }) => handleActionDataElement(selected, "var2")}
                                                                    // disabled={disabled}
                                                                >
                                                                    {selectedKeysReady.map(de => (
                                                                    <SingleSelectOption key={de.value} label={de.label} value={de.value} />
                                                                    ))}
                                                                </SingleSelect>


                                                            </TableCell>


                                                            
                                                        </TableRow>
                                                            
         
                </TableBody>
                </Table>} 
                </div>
                
                {selectedOperator === 'between' &&  <div className="p-5">
                Existing Actions
                <Table
                className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">

                <TableHead className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <TableRowHead className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                        <TableCellHead>Variable 1</TableCellHead>
                        <TableCellHead>Operator</TableCellHead>
                        <TableCellHead>Variable 2</TableCellHead>
                        <TableCellHead>Value</TableCellHead>
                        <TableCellHead>Action</TableCellHead>
                        <TableCellHead></TableCellHead>
                    </TableRowHead>
                </TableHead>
                <TableBody>

                {configuredCondition?.filter(view=>view.dataElement === selectedCondition)?.map(condition => 
                                                        
                                                        <TableRow>
                                                            
                                                            <TableCell>

                                                            <input
                                                                type="text"
                                                                value={getLabelByValue(condition.dataElement_one)}
                                                            
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                                                

                                                            </TableCell>
                                                            <TableCell>
                                                            <input
                                                                type="text"
                                                                value={condition.operator}
                                                    
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                                                


                                                            </TableCell>
                                                            <TableCell>
                                                                

                                                            <input
                                                                type="text"
                                                                value={getLabelByValue(condition.dataElement_two)}
                                             
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                                                


                                                            </TableCell>
                                                            <TableCell>

                                                            <input
                                                                type="text"
                                                                value={condition.value_text}
                                      
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                                                
                                                            </TableCell>
                                                            <TableCell>

                                                            <input
                                                                type="text"
                                                                value={condition.action}

                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                                                
                                                            </TableCell>
                                                            <TableCell>

                                                            <TooltipComponent 
                                                                                    IconType={IconDelete16} 
                                                                                    btnFunc={handleRemoveCondition}
                                                                                    conditionID={condition.conditionID}
                                                                                    // conditionID={selectedCondition}
                                                                                    dynamicText="Remove"
                                                                                    buttonMode="destructive"
                                                                                    customIcon={true}
                                                                                    disabled={false}
                                                                                    />

                                                            </TableCell>
                                                        </TableRow>
                                                        )}
                                                            
         
                </TableBody>
                </Table>
                </div>}

                {selectedOperator === 'equals' && <div className='p-5'>
                    <Table
                                                        className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">

                                                        <TableHead className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                                            <TableRowHead className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                                                <TableCellHead>Variable 1</TableCellHead>
                                                                <TableCellHead>Operator</TableCellHead>
                                                                <TableCellHead>Equal to Value</TableCellHead>
                                                                <TableCellHead>Action</TableCellHead>
                                                                <TableCellHead>Assign</TableCellHead>
                                                                <TableCellHead>Variable 2</TableCellHead>
                                                                <TableCellHead></TableCellHead>
                                                            </TableRowHead>
                                                        </TableHead>
                                                        <TableBody>

                
                                                        {configuredCondition?.filter(view=>view.dataElement === selectedCondition)?.map(condition =>                                            
                                                        <TableRow>
                                                            <TableCell>
                                                            <input
                                                                type="text"
                                                                value={getLabelByValue(condition.dataElement_one)}
                                                            
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>

                                                            </TableCell>
                                                            <TableCell>

                                                            <input
                                                                type="text"
                                                                value={getLabelByValue(condition.operator)}
                                                            
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>


                                                            </TableCell>

                                                            <TableCell>

                                                            <input
                                                                type="text"
                                                                value={getLabelByValue(condition.equals_to)}
                                                            
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                                            </TableCell>
                                                            
                                                            <TableCell>

                                                            
                                                            <input
                                                                type="text"
                                                                value={getLabelByValue(condition.action)}
                                                            
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>


                                                            </TableCell>                             
                                                            <TableCell>
                                                            <input
                                                                type="text"
                                                                value={getLabelByValue(condition.value_text)}
                                                            
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>

                                                            </TableCell>
                                                            <TableCell>
                                                            <input
                                                                type="text"
                                                                value={getLabelByValue(condition.dataElement_two)}
                                                            
                                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>



                                                            </TableCell>

                                                            <TableCell>

                                                                <TooltipComponent 
                                                                                        IconType={IconDelete16} 
                                                                                        btnFunc={handleRemoveCondition}
                                                                                        conditionID={condition.conditionID}
                                                                                        // conditionID={selectedCondition}
                                                                                        dynamicText="Remove"
                                                                                        buttonMode="destructive"
                                                                                        customIcon={true}
                                                                                        disabled={false}
                                                                                        />

                                                            </TableCell>
                                                            
                                                        </TableRow>
                                                        )}
                                                            
         
                </TableBody>
                </Table>
                    
                    </div>}
                </ModalContent>
                <ModalActions>
                    <ButtonStrip>
                        <Button onClick={() => handleCloseModal()}>Close</Button>
                        <Button primary  onClick={() => createCondition()}
                            
                        disabled={selectedCondition === ''}>
                            Create Condition
                        </Button>

                    </ButtonStrip>
                </ModalActions>
        </Modal>

        </div>
    )
}

export default ConfigureCondition
