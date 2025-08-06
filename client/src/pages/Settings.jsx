
import { useState, useEffect } from "react"
import React from "react"
import axios from "axios"
import { PlusIcon,GroupIcon,TrashIcon, SettingsIcon } from "../constants/icons"
import { AddGroup } from "../components/AddGroup"
import { AddAssignee } from "../components/AddAssignee"
import { AssigneeDetails } from "../components/AssigneeDetails"

function Settings() {

    useEffect(()=>{

        axios.get(`/api/a/groups`)
        .then(res=>{
            setAddedGroups(res?.data?.data || [])
        })

        axios.get(`/api/j/assignee`)
        .then(res=>{
            setAssignees(res.data?.data)
        })
        .catch(err=>{
            console.log(err?.message)
        })

    },[])
    
  // Update the initial addedGroups state to include participants:
    const [addedGroups, setAddedGroups] = useState([])
    const [assignees,setAssignees]=useState([])

  //Add new state variables after the existing ones:
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAssigneeModalOpen,setIsAssigneeModalOpen]=useState(false)
  const handleRemoveGroup = (groupId) => {
    axios.delete(`/api/a/groups?groupId=${groupId}`)
    .then(res=>{
      setAddedGroups((prev) => prev.filter((group) => group.id !== groupId))  
    })
    .catch(err=>{
        console.log(err.message)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
                <SettingsIcon />
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Group Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Whatsapp Instance Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Connect a new WhatsApp group to monitor issues or add a new assignee from Jira</p>
          </div>

          <div className="p-6 flex justify-center space-x-4">
            {/* Add Group */}
            <div className="text-center">
              <button
                onClick={()=>setIsAddModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 mx-auto"
              >
                <PlusIcon />
                <span>Add New Group</span>
              </button>
            </div>
            {/* Add Assignee */}
            <div className="text-center">
              <button
                onClick={()=>setIsAssigneeModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 mx-auto"
              >
                <PlusIcon />
                <span>Add New Assignee</span>
              </button>
            </div>
          </div>
        </div>

        <AssigneeDetails assignees={assignees} setAssignees={setAssignees} />

        {/* Connected Groups Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Connected Groups</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your connected WhatsApp groups</p>
              </div>
              <div className="text-sm text-gray-500">
                {addedGroups.length} group{addedGroups.length !== 1 ? "s" : ""} connected
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {addedGroups.length === 0 ? (
              <div className="text-center py-12">
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">No groups connected</h3>
                  <p className="text-sm text-gray-500 mt-1">Add your first WhatsApp group to start monitoring issues</p>
                </div>
              </div>
            ) : (
              // Replace the entire table section in the Connected Groups with this expanded version:
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Lead
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {addedGroups?.map((group) => (
                    <React.Fragment key={group.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <GroupIcon />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{group.name}</div>
                              <div className="text-xs text-gray-500">{group.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{group.description}</div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-1 bg-gray-100 rounded-full mr-2">
                              <UserIcon />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{group?.teamLead || ''}</div>
                              <div className="text-xs text-gray-500">Team Lead</div>
                            </div>
                          </div>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleRemoveGroup(group.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Remove group"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Group Modal */}
      {isAddModalOpen && (
        <AddGroup addedGroups={addedGroups} setAddedGroups={setAddedGroups} closeAddModal={()=>setIsAddModalOpen(false)} />
      )}

      {/* Add Assignee Modal  */}
      {isAssigneeModalOpen && (
        <AddAssignee assignees={assignees} setAssignees={setAssignees} closeAddModal={()=>setIsAssigneeModalOpen(false)} />
      )}
    </div>
  )
}

export default Settings
