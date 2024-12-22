import React from "react";
import Select from "react-select";
import CountryList from "react-select-country-list";

const CountryDropdown: React.FC<{
    value: { value: string; label: string } | null;
    onChange: (selectedOption: { value: string; label: string } | null) => void;
}> = ({ value, onChange }) => {
    const options = CountryList().getData();

    return (
        <div className="w-full mb-6">
            <Select
                id="country"
                options={options}
                value={value}
                onChange={onChange}
                placeholder="Select Country"
                className="react-select-container w-full"
                classNames={{
                    control: () =>
                        "flex items-center border border-gray-300 rounded-lg shadow-sm px-2 py-1 focus:outline-none focus:ring focus:ring-yellow-500 text-sm",
                    menu: () =>
                        "absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto",
                    option: ({ isFocused, isSelected }) =>
                        `cursor-pointer px-4 py-2 ${
                            isFocused ? "bg-yellow-100" : ""
                        } ${isSelected ? "bg-yellow-200 font-semibold" : ""}`,
                    placeholder: () => "text-gray-400",
                    singleValue: () => "text-gray-700 truncate",
                }}
                styles={{
                    control: (base) => ({
                        ...base,
                        minHeight: "32px",
                        paddingLeft: "4px",
                        paddingRight: "4px",
                        justifyContent: "flex-start",
                    }),
                    menu: (base) => ({
                        ...base,
                        position: "absolute",
                        bottom: "100%",
                        marginBottom: "8px",
                        zIndex: 9999,
                    }),
                }}
                menuPlacement="top"
                menuPortalTarget={document.body}
                isSearchable
                getOptionLabel={(option) =>
                    option.value === ""
                        ? "Select Country"
                        : `${option.label}`
                }
                formatOptionLabel={(option) =>
                    option.value ? (
                        <div className="flex items-center gap-2">
                            <img
                                src={`https://flagcdn.com/w40/${option.value.toLowerCase()}.png`}
                                alt=""
                                className="w-5 h-4"
                            />
                            {option.label}
                        </div>
                    ) : (
                        option.label
                    )
                }
            />
        </div>
    );
};

export default CountryDropdown;
