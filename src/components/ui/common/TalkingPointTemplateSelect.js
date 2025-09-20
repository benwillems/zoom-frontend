import React, { useEffect, useState } from 'react';
import { HiTemplate } from 'react-icons/hi';
import { FaComments } from 'react-icons/fa';
import Select from 'react-select';

const TalkingPointTemplateSelect = ({
    selectedTemplateId,
    onTemplateChange,
    className = '',
}) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);

    // Fetch talking point templates
    useEffect(() => {
        fetchTalkingPointTemplates();
    }, []);

    // Update selected option when selectedTemplateId changes
    useEffect(() => {
        if (selectedTemplateId && options.length > 0) {
            const option = options.find(opt => opt.value === selectedTemplateId);
            setSelectedOption(option || null);
        } else {
            setSelectedOption(null);
        }
    }, [selectedTemplateId, options]);

    const fetchTalkingPointTemplates = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/talkingPoints/templates');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const templateList = data.templates || [];
            
            setTemplates(templateList);
            
            // Create options for the select dropdown
            const mappedOptions = templateList.map((template) => ({
                value: template.id,
                label: template.name,
            }));
            
            // Add a default option
            const allOptions = [
                { value: null, label: 'Use Default Template' },
                ...mappedOptions
            ];
            
            setOptions(allOptions);
        } catch (error) {
            console.error('Failed to fetch talking point templates:', error);
            // Fallback to default option only
            setOptions([{ value: null, label: 'Use Default Template' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        onTemplateChange(selectedOption?.value || null);
    };

    if (loading) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <FaComments className="size-4 text-blue-600" />
                <div className="text-sm text-gray-500">Loading templates...</div>
            </div>
        );
    }

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <FaComments className="size-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <Select
                    className="basic-single font-medium text-sm"
                    classNamePrefix="select"
                    value={selectedOption}
                    onChange={handleChange}
                    options={options}
                    isClearable={false}
                    isSearchable={false}
                    name="talkingPointTemplateSelect"
                    menuPlacement="auto"
                    styles={{
                        control: (provided, state) => ({
                            ...provided,
                            minHeight: '36px',
                            fontSize: '14px',
                            borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                            boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                            '&:hover': {
                                borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
                            },
                        }),
                        menuList: (provided) => ({
                            ...provided,
                            maxHeight: '200px',
                            fontSize: '14px',
                        }),
                        option: (provided, state) => ({
                            ...provided,
                            fontSize: '14px',
                            backgroundColor: state.isSelected
                                ? '#3b82f6'
                                : state.isFocused
                                ? '#eff6ff'
                                : 'white',
                            color: state.isSelected ? 'white' : '#374151',
                        }),
                        singleValue: (provided) => ({
                            ...provided,
                            fontSize: '14px',
                            color: '#374151',
                        }),
                    }}
                    placeholder="Select talking points template..."
                />
            </div>
            {templates.length > 0 && (
                <button
                    onClick={fetchTalkingPointTemplates}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Refresh templates"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default TalkingPointTemplateSelect;