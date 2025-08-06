import { useEffect, useState } from "react"
import { XIcon } from "../constants/icons"
import axios from "axios"
import { Dropdown } from "../constants/helpers"

export const AddAssignee = ({ closeAddModal,assignees,setAssignees }) => {
  const [totalAssignees, setTotalAssignees] = useState([])
  const [selectedAssignee, setSelectedAssignee] = useState("")
  const [selectedDays, setSelectedDays] = useState([])
  const [shiftTime, setShiftTime] = useState({ start: "", end: "" })

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  useEffect(() => {
    axios.get('/api/j')
      .then(res => {
        setTotalAssignees(res.data?.data?.filter(assignee=>!assignees?.find(a=>a?.id==assignee?.id)))
      })
  }, [])

  const toggleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const handleAddAssignee=()=>{
    if(!selectedAssignee){
        return;
    }
    const assignee=totalAssignees.find(v=>v.id==selectedAssignee)
    axios.post(`/api/j/assignee`,{
        id: assignee?.id,
        name: assignee?.name,
        shift_start: shiftTime.start,
        shift_end: shiftTime.end,
        days: selectedDays
    })
    .then(res=>{
        setAssignees(prev=>[{
            id: assignee?.id,
            name: assignee?.name,
            shift_start: shiftTime.start,
            shift_end: shiftTime.end,
            days: selectedDays
        },...prev])
        closeAddModal()
    })
    .catch(err=>{
        console.log(err?.message)
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 -z-10 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeAddModal}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">

          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Add New Assignee</h3>
              <button
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
              >
                <XIcon />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Group Template</label>
                <Dropdown
                  options={totalAssignees}
                  value={selectedAssignee}
                  onChange={(value) => setSelectedAssignee(value)}
                  placeholder="Search and select an Assignee..."
                />
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-2">Select Week Days</h4>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDaySelection(day)}
                      className={`px-3 py-1 rounded-md text-sm border ${selectedDays.includes(day) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border-gray-300`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-2">Select Shift Timing (applies to selected days)</h4>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={shiftTime.start}
                      onChange={(e) => setShiftTime({ ...shiftTime, start: e.target.value })}
                      className="w-full px-2 py-1 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={shiftTime.end}
                      onChange={(e) => setShiftTime({ ...shiftTime, end: e.target.value })}
                      className="w-full px-2 py-1 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
              onClick={handleAddAssignee}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Add Assignee
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
} 
