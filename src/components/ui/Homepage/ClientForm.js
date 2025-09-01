import CreatableSelect from "react-select/creatable";
import { useEffect, useState } from "react";
import useSearchClientsStore from "@/store/useSearchClientsStore";
import { MdPeopleAlt, MdEdit, MdEmail } from "react-icons/md";

const ClientForm = ({
  selectedClient,
  setSelectedClient,
  isChecked,
  setIsChecked,
  message,
  clientEmail,
  setClientEmail,
  isEditingEmail,
  setIsEditingEmail,
}) => {
  const { clients } = useSearchClientsStore();
  const [clientOptions, setClientOptions] = useState([]);
  const [inputClientName, setInputClientName] = useState("");

  // Update client options whenever the clients list changes
  useEffect(() => {
    let options = clients?.map((client) => ({
      value: client.id,
      label: client.name,
      email: client.email || "",
    }));

    // Always include an option to add a new client based on the current input
    if (inputClientName) {
      options = [
        ...options,
        {
          value: `${inputClientName}`, // This could be a temporary ID or the name itself
          label: `Add new client "${inputClientName}"`,
          isNew: true,
        },
      ];
    }

    setClientOptions(options);
  }, [clients, inputClientName]);

  const onClientChange = (newValue) => {
    setSelectedClient(newValue);
    if (newValue && newValue.isNew) {
      // User selected "Add new client..."
      setClientEmail("");
      setIsEditingEmail(true); // Open email input for the new client
    } else {
      // User selected an existing client or cleared the selection
      setClientEmail(newValue?.email || "");
      setIsEditingEmail(!newValue?.email);
    }
  };

  // This function is called by onInputChange (typing in select) and onCreateOption
  const handleCreateClientOption = (inputValue) => {
    setInputClientName(inputValue);
  };

  const handleEmailChange = (e) => {
    setClientEmail(e.target.value);
  };

  const toggleEmailEdit = () => {
    setIsEditingEmail(!isEditingEmail);
  };

  return (
    <div className="flex flex-col w-full h-20 justify-center items-center space-y-2 text-sm sm:text-base">
      <div className="w-full">
        <CreatableSelect
          isClearable
          onChange={onClientChange}
          onInputChange={handleCreateClientOption}
          onCreateOption={handleCreateClientOption}
          options={clientOptions}
          value={selectedClient}
          allowCreateWhileLoading
          createOptionPosition="first"
          placeholder={"Type client to search or add client"}
          formatCreateLabel={(inputValue) => `Add new client "${inputValue}"`}
          styles={{
            menuList: (provided) => ({
              ...provided,
              maxHeight: "200px", // Set the max height of the dropdown menu
              fontSize: "16px",
            }),
          }}
          formatOptionLabel={(option, { context }) => {
            if (option?.label.startsWith("Add new client")) {
              return option?.label; // Directly display the label without any formatting
            } else {
              // Regular option display
              return (
                <div className="flex items-center space-x-2">
                  <MdPeopleAlt className="text-lg" />
                  <span>{option?.label}</span>
                </div>
              );
            }
          }}
        />
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}

      <div className="w-full">
        {selectedClient &&
          (isEditingEmail ? (
            <div className="w-full mt-2">
              <input
                type="email"
                value={clientEmail}
                onChange={handleEmailChange}
                onBlur={toggleEmailEdit}
                placeholder="Enter client email"
                className="w-full border border-blue-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 bg-white shadow"
                autoFocus
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-between h-9 bg-gray-100 border border-gray-300 rounded px-2 py-1 mt-2 shadow-sm hover:bg-gray-200 cursor-pointer"
              onClick={toggleEmailEdit}
            >
              <p className="text-sm flex items-center">
                <MdEmail className="mr-1 text-lg" />
                {clientEmail || "Click to add email"}
              </p>
              <MdEdit className="text-gray-500" />
            </div>
          ))}
      </div>

      {/* <div className='flex justify-start items-center w-full pt-1 space-x-2 px-0.5'>
        <input
          type='checkbox'
          id='multipleClients'
          name='multipleClients'
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
        />
        <label htmlFor='multipleClients' className='text-sm'>
          Multiple Clients
        </label>
      </div> */}
    </div>
  );
};

export default ClientForm;
