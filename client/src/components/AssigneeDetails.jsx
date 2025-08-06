import axios from "axios";
import { useEffect, useState } from "react"
import { CalendarIcon, UserIcon,TrashIcon } from "../constants/icons";

function convertToAmPm(time24) {
    const [hourStr, minuteStr] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const ampm = hour >= 12 ? "PM" : "AM";
    
    hour = hour % 12 || 12;
    
    return `${hour}:${minute} ${ampm}`;
}

export const AssigneeDetails = ({assignees,setAssignees}) => {

    const handleRemoveAssignee=(id)=>{
        axios.delete(`/api/j/assignee/${id}`)
        .then(()=>{
            setAssignees(prev=>prev?.filter(assignee=>assignee?.id!=id))
        })
        .catch(err=>console.log(err?.message))
    }


    return (
        <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Jira Assignees</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your connected WhatsApp groups</p>
            </div>
            <div className="text-sm text-gray-500">
                {assignees.length} assignee{assignees.length !== 1 ? "s" : ""}
            </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            {assignees.length === 0 ? (
            <div className="text-center py-12">
                <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">No assignees found</h3>
                <p className="text-sm text-gray-500 mt-1">Add your first assignee to start scheduling shifts</p>
                </div>
            </div>
            ) : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {assignees.map((assignee) => (
                    <tr key={assignee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <UserIcon />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{assignee.name}</div>
                              <div className="text-xs text-gray-500">{assignee.id}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg mr-3">
                              <CalendarIcon />
                            </div>
                            <div className="text-sm font-medium text-gray-900">{assignee?.shift_start?convertToAmPm(assignee?.shift_start):''} - {assignee?.shift_end?convertToAmPm(assignee?.shift_end):''}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-sm font-medium text-gray-900">  {assignee.days.join(", ")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center">
                        <button
                            onClick={() => handleRemoveAssignee(assignee.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove assignee"
                        >
                            <TrashIcon />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
        </div>
    );
};
