
import { useState,useMemo } from "react"
import { ChevronDownIcon,SearchIcon } from "./icons"


const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50"
      case "high":
        return "text-orange-600 bg-orange-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
}

const getStatusColor = (status) => {
  switch (status) {
    case "open":
      return "text-red-600 bg-red-50"
    case "in progress":
      return "text-blue-600 bg-blue-50"
    case "resolved":
      return "text-green-600 bg-green-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

const getAvgResolution=(sec)=>{
  console.log(sec/(60*60*24))
  if(sec>=60*60*24*30) return `${Math.floor(sec/(60*60*24*30))}M`;
  else if(sec>=60*60*24) return `${Math.floor(sec/(60*60*24))}d`;
  else if(sec>=60*60) return `${Math.floor(sec/(60*60))}h`;
  else if(sec>=60) return `${Math.floor(sec/60)}m`;
  else return `${Math.floor(sec)}s`;
}

function Dropdown({ options, value, onChange, placeholder, searchable = true, renderOption, renderValue }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return options
    return options.filter((option) => option?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [options, searchTerm, searchable])

  const selectedOption = options.find((option) => option.id === value)

  const handleSelect = (option) => {
    onChange(option.id)
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
            {selectedOption ? (renderValue ? renderValue(selectedOption) : selectedOption.name) : placeholder}
          </span>
          <ChevronDownIcon />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <SearchIcon />
                </div>
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  {renderOption ? renderOption(option) : option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export {
  getPriorityColor,
  getStatusColor,
  Dropdown,
  getAvgResolution
}
