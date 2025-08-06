
import { XIcon,UserIcon,UserMinusIcon } from "../constants/icons"
import { Dropdown } from "../constants/helpers"
import { useState,useEffect } from "react"
import axios from "axios"

export const AddGroup=({closeAddModal,addedGroups,setAddedGroups})=>{

    const [availableGroups,setAvailableGroups]=useState([])
    const [availableParticipants,setAvailableParticipants]=useState([])
    const [totalGroups,setTotalGroups]=useState([])

    const [modalSelectedGroup, setModalSelectedGroup] = useState("")
    const [modalGroupName, setModalGroupName] = useState("")
    const [modalGroupDescription, setModalGroupDescription] = useState("")
    const [modalGroupId, setModalGroupId] = useState("")

    useEffect(()=>{
        axios.get('/api/w/groups')
        .then(res=>{
            setTotalGroups(res.data?.data || [])
            setAvailableGroups(res.data?.data?.filter((group) => !addedGroups.find((added) => added.id === group.id)))
        })
    },[])

    const handleAddGroup = () => {
        if (!modalSelectedGroup) return

        const group = totalGroups.find((g) => g.id === modalSelectedGroup)
        if (group) {

            axios.post(`/api//a/groups`,{
                id: group?.id,
                name: group?.name,
                description: group?.description,
            })
            .then( res=>{
                setAddedGroups((prev) => [
                    ...prev,
                    {
                        id: modalGroupId || group.id,
                        name: modalGroupName || group.name,
                        description: modalGroupDescription || group.description,
                        participants: availableParticipants,
                    },
                ])
                closeAddModal()
            } )
            .catch(err=>{
                console.log(err?.message)
            })

        }
    }

    const renderGroupOption = (group) => (
        <div>
        <div className="font-medium text-gray-900">{group.name}</div>
        <div className="text-sm text-gray-500">{group.description?group.description?.substring(0,50)+'...':''}</div>
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 -z-10 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeAddModal}></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Add New WhatsApp Group</h3>
                  <button
                    onClick={closeAddModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  >
                    <XIcon />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
                <div className="space-y-6">
                  {/* Group Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Group Template</label>
                    <Dropdown
                      options={availableGroups}
                      value={modalSelectedGroup}
                      onChange={(value) => {
                        axios.get(`/api/w/groups/part?groupId=${value}`)
                        .then( res=>{
                            setModalSelectedGroup(value)
                            const group = totalGroups.find((g) => g.id === value)
                            if (group) {
                                setModalGroupName(group.name)
                                setModalGroupDescription(group.description)
                                setModalGroupId(group.id)
                            }
                            setAvailableParticipants(res.data?.data)
                        } )
                        .catch(err=>{
                            console.log(err?.message)
                        })
                      }}
                      placeholder="Search and select a group template..."
                      renderOption={renderGroupOption}
                    />
                  </div>

                  {/* Custom Group Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                      <input
                        type="text"
                        value={modalGroupName}
                        onChange={(e) => setModalGroupName(e.target.value)}
                        placeholder="Enter group name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Group ID</label>
                      <input
                        type="text"
                        value={modalGroupId}
                        onChange={(e) => setModalGroupId(e.target.value)}
                        placeholder="Enter group ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={modalGroupDescription}
                      onChange={(e) => setModalGroupDescription(e.target.value)}
                      placeholder="Enter group description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    {/* Selected Participants */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Selected Participants ({availableParticipants.length})
                      </h4>
                      {availableParticipants.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">No participants selected yet</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {availableParticipants.map((participant) => (
                            <div
                              key={participant.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border"
                            >
                              <div className="flex items-center min-w-0 flex-1">
                                <div className="p-1 bg-blue-100 rounded-full mr-2 flex-shrink-0">
                                  <UserIcon />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-gray-900 truncate">{participant.name}</div>
                                  <div className="text-xs text-gray-500 truncate">{participant.number}</div>
                                  <div className="text-xs text-gray-400 truncate">{participant.role}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeAddModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGroup}
                    disabled={!modalGroupName}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Add Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}
