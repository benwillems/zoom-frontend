import React, { useEffect, useState } from 'react';
import { HiTemplate } from 'react-icons/hi';
import Select from 'react-select';
import useAudioStore from '@/store/useAudioStore';

const TemplateSelect = ({
    flexCol = false,
    customClass,
    mobile = false,
    setSelectedTemplate,
}) => {
    const { templateId, setTemplateId, defaultTemplate, templateOptions } =
        useAudioStore();
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        const mappedOptions = templateOptions.map((template) => ({
            value: template.id,
            label: template.name,
        }));
        setOptions(mappedOptions);

        let selectedOption = null;
        if (templateId !== null) {
            selectedOption = mappedOptions.find(
                (option) => option.value === templateId
            );
        } else if (defaultTemplate) {
            selectedOption = {
                value: defaultTemplate.id,
                label: defaultTemplate.name,
            };
        }

        if (selectedOption) {
            setSelectedOption(selectedOption);
            setTemplateId(selectedOption.value);
            setSelectedTemplate?.(selectedOption.value); // Pass the selected value to parent
        }
    }, [templateOptions, defaultTemplate, templateId]);

    const handleChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        setTemplateId(selectedOption.value);
        setSelectedTemplate?.(selectedOption.value); // Call parent’s setSelectedTemplate
    };

    return (
        <div
            className={`flex ${
                flexCol ? `flex-col space-y-1` : 'space-x-3'
            } ${customClass}`}
        >
            <div className="flex flex-col justify-center ">
                <div className="flex items-center space-x-1 pt-3">
                    <HiTemplate className="size-5 sm:size-6" />
                    <h1 className="text-base sm:text-xl font-bold">Template</h1>
                </div>
                {!selectedOption && (
                    <p className="mt-2 text-sm text-red-600">
                        No template selected. Please select a template.
                    </p>
                )}
            </div>
            <Select
                className="basic-single w-full font-medium text-base text-black"
                classNamePrefix="select"
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isClearable={false}
                isSearchable={false}
                name="templateSelect"
                menuPlacement={mobile ? 'top' : 'bottom'}
                styles={{
                    menuList: (provided) => ({
                        ...provided,
                        maxHeight: mobile ? '170px' : '250px',
                        fontSize: '16px',
                    }),
                }}
                placeholder={
                    mobile
                        ? 'Select template to generate notes'
                        : 'Select template'
                }
            />
        </div>
    );
};

export default TemplateSelect;
