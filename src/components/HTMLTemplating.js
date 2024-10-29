import React, { useState, useEffect } from 'react';
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime';
import DOMPurify from 'dompurify';

const HtmlTemplateEditor = ({HTMLTemplates, selectedProgram, selectedTemplate}) => {    
    const [htmlContent, setHtmlContent] = useState('');
    const [dataElementValues, setDataElementValues] = useState({});
    const [templateId, setTemplateId] = useState(null); // For loading specific templates
    console.log(selectedProgram)
    console.log(HTMLTemplates)
    console.log(selectedTemplate)
    useEffect(() => {
        if (selectedTemplate) {
            const template_in_view = HTMLTemplates.filter(template => template.name === selectedTemplate )
            console.log(template_in_view)
        }
    }, [selectedTemplate]);

        // Handle changes to the HTML input
    const handleInputChange = (event) => {
        setHtmlContent(event.target.value);
    };

    // Handle changes to data elements' input values
    const handleDataElementChange = (id, value) => {
        setDataElementValues((prevValues) => ({
        ...prevValues,
        [id]: value,
        }));
    };

      // Render HTML content with data elements
  const renderWithDataElements = () => {
    let sanitizedHtml = DOMPurify.sanitize(htmlContent);
    const parsedHtml = sanitizedHtml.replace(
      /{{dataElement:(\w+)}}/g,
      (match, dataElementId) => {
        const value = dataElementValues[dataElementId] || '';
        return `<input 
                  type="text" 
                  value="${value}" 
                  data-id="${dataElementId}"
                  oninput="document.dispatchEvent(new CustomEvent('dataElementChange', { detail: { id: '${dataElementId}', value: this.value }}))"
                  placeholder="Enter value for ${dataElementId}"
                  style="border: 1px solid #ccc; padding: 5px; margin: 5px 0;"
                />`;
      }
    );

    return { __html: parsedHtml };
  };

    return (<></>)
};

export default HtmlTemplateEditor;